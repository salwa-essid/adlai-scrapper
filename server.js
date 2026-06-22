const express = require("express");
const {getStatus } = require("./scr/api/status");
const { runCrawler } = require("./scr/crawler/crawler");
const sources = require("./scr/config/sources.config");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("ADLAI Scraper Running");
});

app.get("/status", (req, res) => {
    res.json(getStatus());
});
app.get("/run", async (req, res) => {
    const results = await runCrawler(sources);
    res.json({ success: true, articles: results.length });
});



app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});