

const { chromium } = require("playwright");

async function playwrightFetch(url) {

    let browser;

    try {

        browser = await chromium.launch({
            headless: true
        });

        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "domcontentloaded"
        });

        const html = await page.content();

        await browser.close();

        return html;

    } catch {

        if (browser) {
            await browser.close();
        }

        return null;
    }
}

module.exports = { playwrightFetch };