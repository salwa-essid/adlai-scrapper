const express = require("express");
const { runCrawler } = require("./scr/crawler/crawler");
const { writeManifest } = require("./scr/storage/manifestWriter");
const sources = require("./scr/config/sources.config");

const app = express();
app.use(express.json());

let crawlState = {
    status: "idle",
    startedAt: null,
    finishedAt: null,
    totalArticles: 0,
    sources: {}
};

app.get("/", (req, res) => {
    res.send("ADLAI Scraper — visit /status or GET /run to start");
});

app.get("/status", (req, res) => {
    res.json(crawlState);
});

app.get("/run", (req, res) => {
    if (crawlState.status === "running") {
        return res.json({ message: "Already running — check /status" });
    }

    res.json({ message: "Scraping started — check /status for progress" });

    crawlState.status = "running";
    crawlState.startedAt = new Date();
    crawlState.finishedAt = null;
    crawlState.totalArticles = 0;
    crawlState.sources = {};

    for (const s of sources) {
        crawlState.sources[s.name] = { status: "pending", articles: 0, error: null, lastUpdated: null };
    }

    runCrawler(sources, (name, status, count, error) => {
        crawlState.sources[name] = {
            status,
            articles: count || 0,
            error: error || null,
            lastUpdated: new Date().toISOString()
        };
        crawlState.totalArticles = Object.values(crawlState.sources)
            .reduce((sum, s) => sum + (s.articles || 0), 0);
    }).then(() => {
        crawlState.status = "done";
        crawlState.finishedAt = new Date().toISOString();
        // A6: write manifest after every run
        writeManifest(crawlState.sources, sources);
    }).catch(err => {
        crawlState.status = "failed";
        crawlState.finishedAt = new Date().toISOString();
        console.error("Crawler fatal error:", err.message);
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
