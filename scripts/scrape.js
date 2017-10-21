// var puppeteer = require('puppeteer');

// module.exports = async function scrape(url, selector) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setViewport({ width: 1025, height: 768 });
//   await page.goto(url);
//   //await page.screenshot({ path: 'screenshots/github.png' });
//   const scrapedText = await page.evaluate((selector) => {
//     return document.body.querySelector(selector).textContent
//   }, selector);

//   browser.close();

//   return scrapedText;
// }