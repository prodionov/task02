import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import scrapeEvent from './src/scrapeEvent'
import jwt from 'jsonwebtoken'
import { response } from './common/response'
import Ajv from 'ajv'
import cors from 'cors'
require('dotenv').config()

const app = express()
const PORT = 3000

app.use(bodyParser.json())
app.use(cors())

const ajv = new Ajv()
const postOddSchema = require('./src/schemas/post-odds-request-schema.json')
const validateOddsRequest = ajv.compile(postOddSchema)

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
    const { url } = req.body
    console.log('req.body', req.body)
    if (!validateOddsRequest(req.body)) {
      console.log(validateOddsRequest.errors)
      throw new Error('Invalid request')
    }
    const data = await scrapeEvent(url)
    res.send(response(200, data))
  } catch (e) {
    console.log('e', e)
    // TODO introduce proper error handling
    // @ts-ignore
    res.send(e.toString())
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})
