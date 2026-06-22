const { chromium } = require('playwright');

async function test() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/a8376aea-1bc3-49d4-9027-aed900b555af/1', {
        waitUntil: 'networkidle',
        timeout: 30000
    });

    await page.waitForTimeout(3000);

    const text = await page.evaluate(() => document.body.innerText);
    console.log("LENGTH:", text.length);
    console.log("SAMPLE:", text.slice(0, 500));

    await browser.close();
}

test().catch(console.error);