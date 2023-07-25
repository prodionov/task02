import puppeteer, { Browser } from 'puppeteer'

enum ErrorEnum {
  EVENT_NOT_AVAILABLE = 'Event not available',
  PAGE_NOT_FOUND = 'Page not found',
}

interface HorseInformation {
  horseName: string | null
  odds: string | null
}

const eventTypes = ['upcomingEvent', 'justFinishedEvent']
const localFileUrlMap = {
  upcomingEvent: `file://${__dirname}/../__fixture__/upcomingEvent.html`,
  justFinishedEvent: `file://${__dirname}/../__fixture__/justFinishedEvent.html`,
}

const validatePageTitle = async (title: string, browser: Browser) => {
  if (title === ErrorEnum.EVENT_NOT_AVAILABLE) {
    await browser.close()
    throw new Error('Event not available')
  }
  if (title === ErrorEnum.PAGE_NOT_FOUND) {
    await browser.close()
    throw new Error('Page not found')
  }
}

const scrapeEvent = async (eventUrl: string) => {
  // I have omitted the validation of the eventUrl as it is done by schema validation in the API
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const isLocalTesting = eventTypes.includes(eventUrl)
  await page.setJavaScriptEnabled(!isLocalTesting)
  await page.goto(isLocalTesting ? localFileUrlMap[eventUrl as keyof typeof localFileUrlMap] : eventUrl)

  const title = await page.title()
  await validatePageTitle(title, browser)

  // As on each run we start a new browser instance, we always have to accept cookies
  const cookiesButtonQuery = `button[id="onetrust-accept-btn-handler"]`
  await page.waitForSelector(cookiesButtonQuery)
  const cookiesButton = await page.$(cookiesButtonQuery)
  await cookiesButton!.evaluate((el) => el.click())

  // Check that the event has not finished yet by checking if there is a <section class="market">
  // That contains the results table
  const marketNodeQuery = `section[class="markets"]`
  const marketNode = await page.$(marketNodeQuery)
  if (marketNode) {
    await browser.close()
    throw new Error('The event is in progress or has already finished')
  }

  const horsesInformationQuery = `div:has(> button[aria-label^="Horse name"])`
  const horseNameQuery = `div[aria-label^="Horse name"]`
  const oddsQuery = `div[aria-label*="Add to bet slip"] > span > span`
  await page.waitForSelector(horseNameQuery)

  const horsesInformation: HorseInformation[] = await page.$$eval(
    horsesInformationQuery,
    (elements, horseNameQuery, oddsQuery) => {
      return elements.map((el) => {
        return {
          horseName: el.querySelector(horseNameQuery)?.textContent ?? null,
          odds: el.querySelector(oddsQuery)?.textContent ?? null,
        }
      })
    },
    horseNameQuery,
    oddsQuery
  )

  await browser.close()

  return horsesInformation
}

export default scrapeEvent
