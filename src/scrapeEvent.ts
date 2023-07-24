import puppeteer, { Browser } from 'puppeteer'

enum ErrorEnum {
  EVENT_NOT_AVAILABLE = 'Event not available',
  PAGE_NOT_FOUND = 'Page not found',
}

interface HorseInformation {
  horseName: string | null
  odds: string | null
}

const localFileUrl = `file://${__dirname}/../__fixture__/page.html`
const urlRegex = new RegExp('^https:\\/\\/m\\.skybet\\.com\\/horse-racing\\/.*\\/event\\/\\d+$')

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

const validateUrl = (url: string) => {
  // For testing purposes
  if (url === 'localFile') {
    return
  }
  if (!url) {
    throw new Error('Url is required')
  }
  if (!urlRegex.test(url)) {
    throw new Error('Invalid url')
  }
}

const scrapeEvent = async (url: string) => {
  await validateUrl(url)

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  page.setJavaScriptEnabled(!(url === 'localFile'))
  await page.goto(url === 'localFile' ? localFileUrl : url)

  const title = await page.title()
  await validatePageTitle(title, browser)

  // As on each run we start a new browser instance, we always have to accept cookies
  const cookiesButtonQuery = `button[id="onetrust-accept-btn-handler"]`

  await page.waitForSelector(cookiesButtonQuery)
  const cookiesButton = await page.$(cookiesButtonQuery)
  await cookiesButton!.evaluate((el) => el.click())

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
