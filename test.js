const { chromium } = require('playwright');

async function test() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/a8376aea-1bc3-49d4-9027-aed900b555af/1', {
        waitUntil: 'networkidle',
        timeout: 60000
    });

    await page.waitForTimeout(5000);

    const text = await page.evaluate(() => document.body.innerText);

    const lines = text.split('\n').filter(l => l.match(/المادة|Article/));
    console.log("ARTICLE LINES:", lines.slice(0, 15));

    await browser.close();
}

test().catch(console.error);