const axios = require("axios");
const puppeteer = require("puppeteer");

async function axiosFetch(url) {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
        );

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 60000
        });

        const html = await page.content();

        console.log("Axios success (actually browser)");
        console.log("HTML LENGTH:", html.length);

        return html;

    } catch (err) {
        console.log("Fetch error:", err.message);
        return null;

    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { axiosFetch };