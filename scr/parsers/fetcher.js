//fetcher.js=======fetchpage() and downloadPdf()
// ,timeout,download pdf pdf parsing source failure

const axios = require("axios");
const https = require("https");

const agent = new https.Agent({ rejectUnauthorized: false });
async function fetchPage(url, retries = 3) {
    //retry + backoff
    for (let i = 0; i < retries; i++) {
        try {
            const res = await axios.get(url, {
                timeout: 15000,
                httpsAgent: agent,
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            return res.data;
        } catch (err) {
            console.warn(` Attempt ${i + 1} failed for ${url}: ${err.message}`);
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        }
    }
}
async function downloadPdf(url) {
    try {
        const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 60000,
            maxRedirects: 10,
            httpsAgent: agent,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0 Safari/537.36"
            }
        });

        return Buffer.from(res.data);

    } catch (err) {
        console.log("AXIOS FAILED -> PLAYWRIGHT FALLBACK");

        const browser = await chromium.launch({
            headless: true
        });

        try {
            const page = await browser.newPage();

            const response = await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 60000
            });

            const buffer = await response.body();

            return Buffer.from(buffer);

        } finally {
            await browser.close();
        }
    }
}

module.exports = { fetchPage, downloadPdf };