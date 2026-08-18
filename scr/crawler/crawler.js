const { downloadPdf, fetchPage } = require("../parsers/fetcher");
const { parsePdf } = require("../parsers/pdfParser");
const { extractArticles } = require("../parsers/articleParser");
const { saveData } = require("../storage/fileWriter");
const { isGoodContent } = require("../utils/filters");
const { chromium } = require("playwright");
const path = require("path");
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

        // MANUAL OVERRIDE (2026-08-18): some sources have a hand-verified
        // output that the automated parser can't reliably reproduce (see
        // sources.config.js comment on pdpl). Skip re-parsing and just
        // report the existing output as-is, so a routine re-run doesn't
        // silently clobber a manually-fixed source with a broken one.
        if (source.manualOverride) {
            try {
                const existingPath = path.join(__dirname, "../../output", source.name, `${source.name}_articles.json`);
                const existing = JSON.parse(fs.readFileSync(existingPath, "utf-8"));
                console.log(`SKIPPED (manualOverride): ${source.name} — keeping ${existing.length} existing articles`);
                onProgress(source.name, "success", existing.length, null);
                results.push(...existing);
            } catch (e) {
                console.warn(`  manualOverride source ${source.name} has no existing output: ${e.message}`);
                onProgress(source.name, "failed", 0, `manualOverride set but no existing output/${source.name}/ found`);
            }
            continue;
        }

        try {
            console.log(`\nProcessing: ${source.name}`);
            let extracted = [];
            if (source.method === "pdf") {
                console.log("  Downloading PDF...");
                const buffer = await downloadPdf(source.url);
                const text = await parsePdf(buffer, { reverseText: !!source.reverseText });
                console.log("SOURCE:", source.name);
                console.log("TEXT LENGTH:", text.length);
                console.log(text.slice(0, 1000));
                extracted = extractArticles(text, source.url);
            } else if (source.method === "local_pdf") {
                const buffer = fs.readFileSync(source.url);
                const text = await parsePdf(buffer, { reverseText: !!source.reverseText });
                extracted = extractArticles(text, source.url);
            } else if (source.method === "multi_pdf") {
                //merge multiple PDFs under one source, tag each article with its doc
                const labels = source.docLabels || source.urls.map((_, i) => `doc_${i + 1}`);
                let globalIndex = 1;
                for (let i = 0; i < source.urls.length; i++) {
                    const url = source.urls[i];
                    const label = labels[i];
                    // reverseText can be a single bool (applies to every URL
                    // in this source) or an array parallel to urls/docLabels
                    // for sources where only some docs need it (e.g. SAMA:
                    // only the new Central Bank Law PDF is reversed, the
                    // Banking Control Law one isn't).
                    const reverseText = Array.isArray(source.reverseText)
                        ? !!source.reverseText[i]
                        : !!source.reverseText;
                    try {
                        console.log(`  -> [${label}] ${url}`);
                        const buffer = await downloadPdf(url);
                        const text = await parsePdf(buffer, { reverseText });
                        const articles = extractArticles(text, url);
                        console.log(`[${label}] PDF LENGTH:`, text.length);
                        console.log(`[${label}] ARTICLES:`, articles.length);
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
                await page.goto(source.url, { waitUntil: "", timeout: 60000 });
                await page.waitForTimeout(3000);
                const text = await page.evaluate(() => document.body.innerText);
                await browser.close();
                extracted = extractArticles(text, source.url);

            } else {
                throw new Error(`unknown method: ${source.method}`);
            }

            console.log(`  articles found: ${extracted.length}`);

            console.log("SOURCE:", source.name);
            console.log("FINAL COUNT (before sanity check):", extracted.length);

            // Sanity check (Alex, adlai-scrapper review 2026-08-18; refined
            // same day after it false-positived on nca/sama/zatca_guidelines).
            //
            // First version checked extracted[0] only and failed the WHOLE
            // source if it looked like boilerplate. That broke on PDFs whose
            // article splitter has no numbered heading to anchor on before
            // the real content starts — the cover page / classification
            // banner (nca) or table-of-contents (sama, zatca_guidelines) gets
            // mis-split as "article 1", even though real articles follow it
            // right after. Failing the whole source there throws away good
            // data over a labeling artifact.
            //
            // Fixed version: drop any *leading* entries that don't look like
            // real content (cover page / TOC noise), keep everything from
            // the first real-looking entry onward. Only fail the source if
            // NOTHING in it looks real — that's the actual "we scraped a
            // dead page, not the document" case Alex's check was meant to
            // catch.
            const firstGoodIndex = extracted.findIndex(a => isGoodContent(a.text));

            if (extracted.length > 0 && firstGoodIndex === -1) {
                console.warn(`  x rejected ${source.name}: no extracted entry looks like real content (likely boilerplate/website chrome)`);
                onProgress(source.name, "failed", 0, "No extracted article looks like real document content (likely boilerplate/website chrome)");
            } else if (extracted.length > 0) {
                if (firstGoodIndex > 0) {
                    console.warn(`  dropping ${firstGoodIndex} leading junk entr${firstGoodIndex === 1 ? "y" : "ies"} for ${source.name} (cover page / table-of-contents noise, not real articles)`);
                    extracted = extracted.slice(firstGoodIndex);
                }
                console.log("SOURCE:", source.name);
                console.log("FINAL COUNT:", extracted.length);
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