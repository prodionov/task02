import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import scrapeEvent from './src/scrapeEvent'
import jwt from 'jsonwebtoken'
import { response } from './common/response'
import cors from 'cors'
require('dotenv').config()

const app = express()
const PORT = 3000
app.use(bodyParser.json())
app.use(cors())

function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.SECRET_KEY as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403)
    req.body.user = user
    next()
  })
}

app.get('/', (req, res) => {
  res.send('Test')
})

app.post('/createNewUser', async (req, res) => {
  const token = jwt.sign({ name: req.body.username }, process.env.SECRET_KEY!, { expiresIn: '1800s' })
  res.send(response(200, token))
})

app.post('/odds', authenticateToken, async (req, res) => {
  try {
    const data = await scrapeEvent(req.body.url)
    res.send(response(200, data))
  } catch (e) {
    console.log('e', e)
    res.send(e)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})
