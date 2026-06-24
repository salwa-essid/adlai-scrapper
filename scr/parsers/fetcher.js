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
    const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000,
        httpsAgent: agent,
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    console.log("URL:", url);
    console.log("CONTENT-TYPE:", res.headers["content-type"]);
    console.log("STATUS:", res.status);

    return Buffer.from(res.data);
}

module.exports = { fetchPage, downloadPdf };