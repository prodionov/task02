import puppeteer, { Browser } from 'puppeteer'

enum ErrorEnum {
  EVENT_NOT_AVAILABLE = 'Event not available',
  PAGE_NOT_FOUND = 'Page not found',
}

interface HorseInformation {
  horseName: string | null
  odds: string | null
}

const eventTypes = ['upcomingEvent', 'justFinishedEvent', 'runningEvent']
const localFileUrlMap = {
  upcomingEvent: `file://${__dirname}/../__fixture__/upcomingEvent.html`,
  justFinishedEvent: `file://${__dirname}/../__fixture__/justFinishedEvent.html`,
  runningEvent: `file://${__dirname}/../__fixture__/runningEvent.html`,
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

const scrapeEvent = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const isLocalTesting = eventTypes.includes(url)
  page.setJavaScriptEnabled(!isLocalTesting)
  await page.goto(isLocalTesting ? localFileUrlMap[url as keyof typeof localFileUrlMap] : url)

  const title = await page.title()
  await validatePageTitle(title, browser)

  // As on each run we start a new browser instance, we always have to accept cookies
  const cookiesButtonQuery = `button[id="onetrust-accept-btn-handler"]`
  console.log('we cannot find the button')
  await page.waitForSelector(cookiesButtonQuery)
  const cookiesButton = await page.$(cookiesButtonQuery)
  await cookiesButton!.evaluate((el) => el.click())
  console.log('we are here')
  // Check that the event has not started yet by checking if there is a <section class="market">
  // Potentially that can be improved by comparing the current time with the start time of the event
  // So we don't have to wait for the result
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

  // Response does not include horses that are not running in the event.
  // We can filter them out as there would be a requirement for that.
  return horsesInformation
}

export default scrapeEvent
