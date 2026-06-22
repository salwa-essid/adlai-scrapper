// const axios = require("axios");
//
// async function test() {
//     try {
//         const url = "https://www.sama.gov.sa";
//
//         const response = await axios.get(url);
//
//         console.log("STATUS:", response.status);
//         console.log("DATA:");
//         console.log(response.data);
//     } catch (err) {
//         console.log("ERROR:", err.message);
//     }
// }
//
// test();
// const smartScrape = require("./smartScraper");
//
// async function run() {
//     const url = "https://www.sama.gov.sa"; // جرب أي site
//
//     const result = await smartScrape(url);
//
//     console.log("METHOD USED:", result.method);
//     console.log("DATA LENGTH:", result.data.length);
// }
//
// run();


// const smartScrape = require("./smartScraper");
//
// async function run() {
//     //const url = "https://example.com";
//     const url = "https://zatca.gov.sa/en/Pages/default.aspx";
//
//     const result = await smartScrape(url);
//
//     console.log("METHOD:", result.method);
//     console.log("TEXT SAMPLE:");
//     console.log(result.data.slice(0, 300)); // نوريك أول 300 حرف فقط
// }
//
// run();

const { runCrawler } = require("./scr/crawler/crawler");
const { saveOutput } = require("./scr/storage/fileWriter");
const sources = require("./scr/config/sources.config.js");

async function main() {
    try {
        const results = await runCrawler(sources);

        console.log("✅ DONE — Articles found:", results.length);

        // group by source
        const grouped = {};

        for (const a of results) {
            const key = a.source_url || "unknown";

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(a);
        }

        // save per law type (zatca, companies, etc.)
        for (const source of sources) {
            const key = source.name;

            const articles = grouped[source.url] || [];

            const fullText = articles.map(a => a.text).join("\n\n");

            saveOutput(key, fullText, articles);

            console.log(`💾 Saved ${key}: ${articles.length}`);
        }

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

main();