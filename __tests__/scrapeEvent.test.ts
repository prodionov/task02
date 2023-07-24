import scrapeEvent from '../src/scrapeEvent'

const incorrectURL = 'https://horse-racing/monmouth-park/event/31907924'
const pastEventURL = 'https://m.skybet.com/horse-racing/la-teste-de-buch/event/31903725'

const validEventRespones = [
  {
    horseName: 'News Box',
    odds: '5/2',
  },
  {
    horseName: 'Much Better',
    odds: '9/4',
  },
  {
    horseName: 'Jarlian',
    odds: '11/4',
  },
  {
    horseName: 'Portal One',
    odds: '6/1',
  },
  {
    horseName: 'Puttheglassdown',
    odds: '13/2',
  },
  {
    horseName: 'We Ready',
    odds: '18/1',
  },
  {
    horseName: 'Captain Chazz',
    odds: '33/1',
  },
  {
    horseName: 'My Devils Child',
    odds: null,
  },
]

describe('GIVEN scrapEvent is called', () => {
  afterEach(() => {})
  describe('WHEN url is not valid', () => {
    it('THEN throw an error', async () => {
      await expect(scrapeEvent(incorrectURL)).rejects.toThrow('Invalid url')
    })
  })

  describe('WHEN url is for the past event', () => {
    it('THEN throw an error', async () => {
      await expect(scrapeEvent(pastEventURL)).rejects.toThrow('Event not available')
    })
  })

  describe('WHEN url is valid', () => {
    it('THEN return the horse information', async () => {
      const result = await scrapeEvent(`localFile`)
      expect(result).toMatchObject(validEventRespones)
    })
  })
})
