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

require("dotenv").config();
const { runCrawler } = require("./scr/crawler/crawler");
const { startServer } = require("./scr/server/statusServer");

async function main() {
    startServer();      // status API
    await runCrawler(); // scraping pipeline
}

main();