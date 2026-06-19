const cheerio = require("cheerio");
const pLimit = require("p-limit").default;

const sources = require("../config/sources.config");
const { smartFetch } = require("../utils/smartFetcher");
const { cleanText } = require("../utils/cleaner");
const { isAllowed, isGoodContent } = require("../utils/filters");
const { saveData } = require("../storage/fileWriter");
const logger = require("../utils/logger");

const limit = pLimit(3);

const visited = new Set();
const results = [];

/**
 * Simple article extractor (NO structure change)
 */
function extractArticles(html) {

    const articles = [];

    const regex = /<h\d[^>]*>(.*?)<\/h\d>|<p[^>]*>(.*?)<\/p>/gs;

    let match;
    let index = 1;

    while ((match = regex.exec(html)) !== null) {

        const text = (match[1] || match[2])
            ?.replace(/<[^>]+>/g, "")
            .trim();

        if (text && text.length > 30) {
            articles.push({
                article_number: index++,
                language: "en",
                text
            });
        }
    }

    return articles;
}

async function crawl(url, depth = 0) {

    if (
        visited.has(url) ||
        depth > (process.env.MAX_DEPTH || 2)
    ) {
        return;
    }

    visited.add(url);

    logger.info(`Crawling: ${url} | depth: ${depth}`);

    try {

        const html = await smartFetch(url);

        if (!html) return;

        const clean = cleanText(html);

        if (isGoodContent(clean)) {

            const articles = extractArticles(html);

            results.push({
                url,
                articles: articles.length > 0
                    ? articles
                    : [{
                        article_number: 1,
                        language: "en",
                        text: clean.slice(0, 800)
                    }]
            });
        }

        const $ = cheerio.load(html);

        const links = $("a")
            .map((_, el) => $(el).attr("href"))
            .get()
            .filter(Boolean)
            .map(link => {
                try {
                    return link.startsWith("http")
                        ? link
                        : new URL(link, url).href;
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .filter(isAllowed)
            .slice(0, process.env.MAX_LINKS_PER_PAGE || 5);

        await Promise.all(
            links.map(link =>
                limit(() => crawl(link, depth + 1))
            )
        );

    } catch (err) {
        logger.error(`Crawler error on ${url}: ${err.message}`);
    }
}

async function runCrawler() {

    for (const source of sources) {

        visited.clear();
        results.length = 0;

        logger.info(`Starting source: ${source.name}`);

        await crawl(source.url);

        saveData(source.name, results);

        logger.info(
            `Finished ${source.name} | pages: ${results.length}`
        );
    }
}

module.exports = { runCrawler };