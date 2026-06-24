const { downloadPdf, fetchPage } = require("../parsers/fetcher");
const { parsePdf } = require("../parsers/pdfParser");
const { extractArticles } = require("../parsers/articleParser");
const { saveData } = require("../storage/fileWriter");
const { chromium } = require("playwright");
const fs = require("fs");

async function runCrawler(sources = [], onProgress = () => {}) {
    const results = [];

    for (const source of sources) {
        // handle blocked sources honestly
        if (source.method === "blocked") {
            console.log(`BLOCKED: ${source.name} — ${source.blockedReason}`);
            onProgress(source.name, "blocked", 0, source.blockedReason);
            continue;
        }

        try {
            console.log(`\nProcessing: ${source.name}`);
            let extracted = [];

            if (source.method === "pdf") {
                console.log("  Downloading PDF...");
                const buffer = await downloadPdf(source.url);
                const text = await parsePdf(buffer);
                extracted = extractArticles(text, source.url);

            } else if (source.method === "local_pdf") {
                const buffer = fs.readFileSync(source.url);
                const text = await parsePdf(buffer);
                extracted = extractArticles(text, source.url);

            } else if (source.method === "multi_pdf") {
                // A1: merge multiple PDFs under one source, tag each article with its doc
                const labels = source.docLabels || source.urls.map((_, i) => `doc_${i + 1}`);
                let globalIndex = 1;

                for (let i = 0; i < source.urls.length; i++) {
                    const url = source.urls[i];
                    const label = labels[i];
                    try {
                        console.log(`  -> [${label}] ${url}`);
                        const buffer = await downloadPdf(url);
                        const text = await parsePdf(buffer);
                        const articles = extractArticles(text, url);
                        const tagged = articles.map(a => ({
                            ...a,
                            source_doc: label,
                            article_number: `${label}_${a.article_number}`,
                            global_index: globalIndex++
                        }));
                        console.log(`     found ${tagged.length} articles`);
                        extracted.push(...tagged);
                    } catch (e) {
                        console.warn(`  x failed [${label}]: ${e.message}`);
                    }
                }

            } else if (source.method === "html") {
                const html = await fetchPage(source.url);
                extracted = extractArticles(html, source.url);

            } else if (source.method === "browser") {
                console.log("  Launching browser...");
                const browser = await chromium.launch({ headless: true });
                const page = await browser.newPage();
                await page.goto(source.url, { waitUntil: "networkidle", timeout: 60000 });
                await page.waitForTimeout(3000);
                const text = await page.evaluate(() => document.body.innerText);
                await browser.close();
                extracted = extractArticles(text, source.url);

            } else {
                throw new Error(`unknown method: ${source.method}`);
            }

            console.log(`  articles found: ${extracted.length}`);

            if (extracted.length > 0) {
                saveData(source.name, extracted);
                onProgress(source.name, "success", extracted.length, null);
            } else {
                onProgress(source.name, "failed", 0, "No articles extracted");
            }

            results.push(...extracted);

        } catch (err) {
            console.error(`  source failed: ${source.name} — ${err.message}`);
            onProgress(source.name, "failed", 0, err.message);
        }
    }

    return results;
}

module.exports = { runCrawler };
