
//browser fetcher
const { chromium } = require("playwright");
async function browserFetcher(source) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(source.url, {
        waitUntil: "networkidle",
        timeout: 60000
    });

    const content = await page.content();
    await browser.close();
    return content;
}

module.exports = { browserFetcher };