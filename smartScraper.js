const axios = require("axios");
const { chromium } = require("playwright");


// 🧼 1. تنظيف HTML
function cleanHTML(html) {
    return html
        .replace(/<script[^>]*>.*?<\/script>/gs, "") // يشيل JS
        .replace(/<style[^>]*>.*?<\/style>/gs, "")   // يشيل CSS
        .replace(/<[^>]+>/g, " ")                     // يشيل HTML tags
        .replace(/\s+/g, " ")                        // ينظف spaces
        .trim();                                     // يشيل فراغات البداية والنهاية
}


// 🟢 AXIOS scraper
async function fetchWithAxios(url) {
    try {
        const res = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"
            }
        });

        const cleaned = cleanHTML(res.data);

        return {
            success: true,
            method: "axios",
            data: cleaned
        };

    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}


// 🔴 PLAYWRIGHT scraper
async function fetchWithPlaywright(url) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle" });

        const html = await page.content();

        const cleaned = cleanHTML(html);

        await browser.close();

        return {
            success: true,
            method: "playwright",
            data: cleaned
        };

    } catch (err) {
        await browser.close();

        return {
            success: false,
            error: err.message
        };
    }
}


// 🧠 SMART logic
async function smartScrape(url) {
    console.log("Trying Axios...");

    const axiosResult = await fetchWithAxios(url);

    if (axiosResult.success) {
        return axiosResult;
    }

    console.log("Axios failed → switching to Playwright...");

    const playResult = await fetchWithPlaywright(url);

    return playResult;
}

module.exports = smartScrape;