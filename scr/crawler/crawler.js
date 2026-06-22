
const axios = require("axios");
const xml2js = require("xml2js");

const { downloadPdf, fetchPage } = require("../parsers/fetcher");
const { parsePdf } = require("../parsers/pdfParser");
const { extractArticles } = require("../parsers/articleParser");
const { setStatus } = require("../api/status");

async function getSitemapLinks(sitemapUrl) {
    const res = await axios.get(sitemapUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 15000
    });

    const parsed = await xml2js.parseStringPromise(res.data);

    // 🔍 نشوف شو راجع فعلاً
    console.log("📦 Sitemap keys:", Object.keys(parsed));

    // بعض sitemaps تكون sitemapindex مش urlset
    if (parsed.sitemapindex) {
        const subSitemaps = parsed.sitemapindex.sitemap.map(s => s.loc[0]);
        console.log("📂 Sub-sitemaps found:", subSitemaps.length);

        // نجيب URLs من كل sub-sitemap
        const allUrls = [];
        for (const sub of subSitemaps.slice(0, 5)) { // أول 5 بس ما نغرق
            try {
                const subRes = await axios.get(sub, { timeout: 15000 });
                const subParsed = await xml2js.parseStringPromise(subRes.data);
                if (subParsed.urlset?.url) {
                    allUrls.push(...subParsed.urlset.url.map(u => u.loc[0]));
                }
            } catch (e) {
                console.warn("⚠️ Sub-sitemap failed:", sub);
            }
        }
        return allUrls;
    }

    // normal sitemap
    if (parsed.urlset?.url) {
        return parsed.urlset.url.map(u => u.loc[0]);
    }

    console.warn("⚠️ Unknown sitemap format");
    return [];
}

async function runCrawler(sources = []) {
    const results = [];

    for (const source of sources) {
        try {
            console.log(`\n📥 Processing: ${source.name}`);

            let extracted = [];

            if (source.method === "pdf") {
                console.log("📄 Downloading PDF...");
                const buffer = await downloadPdf(source.url);
                const text = await parsePdf(buffer);

                extracted = extractArticles(text, source.url);

            } else if (source.method === "browser") {
                console.log("🌐 Launching browser...");
                const { chromium } = require('playwright');

                const browser = await chromium.launch({ headless: true });
                const page = await browser.newPage();

                await page.goto(source.url, {
                    waitUntil: 'networkidle',
                    timeout: 30000
                });

                const html = await page.content(); // 🔥 FIX مهم

                await browser.close();

                extracted = extractArticles(html, source.url);

            } else if (source.method === "html") {
                console.log("🌐 Fetching HTML page...");
                const html = await fetchPage(source.url);

                extracted = extractArticles(html, source.url);

            } else if (source.method === "sitemap") {
                const urls = await getSitemapLinks(source.url);

                for (const url of urls) {
                    try {
                        const html = await fetchPage(url);
                        extracted.push(...extractArticles(html, url));
                    } catch (e) {
                        console.warn("⚠️ Failed:", url);
                    }
                }
            }

            console.log(`✅ Articles found: ${extracted.length}`);

            results.push(...extracted);

        } catch (err) {
            console.error(`❌ Source failed: ${source.name} — ${err.message}`);
        }
    }

    return results;
}


module.exports = { runCrawler };