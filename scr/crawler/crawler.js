const axios = require("axios");
const xml2js = require("xml2js");
const { downloadPdf, fetchPage } = require("../parsers/fetcher");
const { parsePdf } = require("../parsers/pdfParser");
const { extractArticles } = require("../parsers/articleParser");
const { saveData } = require("../storage/fileWriter");
const { chromium } = require("playwright")
async function getSitemapLinks(sitemapUrl) {
    const res = await axios.get(sitemapUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 15000
    });

    const parsed = await xml2js.parseStringPromise(res.data);
    if (parsed.sitemapindex) {
        const subSitemaps = parsed.sitemapindex.sitemap.map(s => s.loc[0]);
        const allUrls = [];
        for (const sub of subSitemaps.slice(0, 5)) {
            try {
                const subRes = await axios.get(sub, { timeout: 15000 });
                const subParsed = await xml2js.parseStringPromise(subRes.data);
                if (subParsed.urlset?.url) {
                    allUrls.push(...subParsed.urlset.url.map(u => u.loc[0]));
                }
            } catch (e) {
                console.warn(` Sub-sitemap failed: ${sub}`);
            }
        }

        return allUrls;
    }

    if (parsed.urlset?.url) {
        return parsed.urlset.url.map(u => u.loc[0]);
    }

    return [];
}

async function runCrawler(sources = [], onProgress = () => {}) {
    const results = [];
    for (const source of sources) {
        try {
            console.log(`Processing: ${source.name}`);
            let extracted = [];
            if (source.method === "pdf") {
                console.log(" Downloading PDF...");
                const buffer = await downloadPdf(source.url);
                const text = await parsePdf(buffer);
                console.log("SOURCE:", source.name);
                console.log("TEXT SIZE:", text?.length || 0);
                extracted = extractArticles(text, source.url);
            } else if (source.method === "html") {
                console.log("Fetching HTML page...");
                const html = await fetchPage(source.url);
                console.log("SOURCE:", source.name);
                console.log("HTML SIZE:", html?.length || 0);
                extracted = extractArticles(html, source.url);
            } else if (source.method === "browser") {
                console.log(" Launching browser...");
                const browser = await chromium.launch({
                    headless: true
                });
                const page = await browser.newPage();
                await page.goto(source.url, {
                    waitUntil: "networkidle",
                    timeout: 60000
                });
                await page.waitForTimeout(5000);
                const text = await page.evaluate(
                    () => document.body.innerText
                );
                await browser.close();
                // console.log("SOURCE:", source.name);
                // console.log("TEXT SIZE:", text?.length || 0);
                extracted = extractArticles(text, source.url);
            } else if (source.method === "sitemap") {
                const urls = await getSitemapLinks(source.url);
                for (const url of urls) {
                    try {
                        const html = await fetchPage(url);
                        extracted.push(
                            ...extractArticles(html, url)
                        );
                    } catch (e) {
                        console.warn(`failed: ${url}`);
                    }
                }
            } else {
                throw new Error(`unknown method: ${source.method}`);
            }

            console.log(`articles found: ${extracted.length}`);
            if (extracted.length > 0) {
                saveData(source.name, extracted);
                onProgress(
                    source.name,
                    "success",
                    extracted.length,
                    null
                );
            } else {
                onProgress(
                    source.name,
                    "failed",
                    0,
                    "No articles found"
                );
            }

            results.push(...extracted);

        } catch (err) {
            console.error(`source failed: ${source.name} — ${err.message}`);
            onProgress(
                source.name,
                "failed",
                0,
                err.message
            );
        }
    }

    return results;
}

module.exports = { runCrawler };