const cheerio = require("cheerio");

function cleanHtml(html) {
    const $ = cheerio.load(html);

    $("script, style, noscript, iframe, nav, footer, header").remove();

    return $("body")
        .text()
        .replace(/\s+/g, " ")
        .replace(/[\u200B-\u200F\uFEFF]/g, "")
        .replace(/ـ+/g, "")
        .trim();
}

function extractArticles(rawText, sourceUrl) {

    const text = rawText?.trim()?.startsWith("<")
        ? cleanHtml(rawText)
        : (rawText || "").replace(/\s+/g, " ").trim();

    if (!text || text.length < 300) return [];

    // detect articles (Arabic + English)
    const pattern = /المادة\s*\(?\s*(\d+)\s*\)?/g;
    const englishPattern = /Article\s+(\d+)/gi;

    let matches = [];

    for (const m of text.matchAll(pattern)) {
        matches.push({ index: m.index, num: parseInt(m[1]) });
    }

    for (const m of text.matchAll(englishPattern)) {
        matches.push({ index: m.index, num: parseInt(m[1]) });
    }

    if (matches.length === 0) {
        return [{
            article_number: 1,
            text: text.slice(0, 3000),
            source_url: sourceUrl,
            fetched_at: new Date().toISOString()
        }];
    }

    // STEP 1: sort by position in text
    matches.sort((a, b) => a.index - b.index);

    // STEP 2: simple dedupe (by article number)
    const seen = new Set();
    const unique = [];

    for (const m of matches) {
        if (seen.has(m.num)) continue;
        seen.add(m.num);
        unique.push(m);
    }

    // STEP 3: build articles sequentially
    const articles = [];

    for (let i = 0; i < unique.length; i++) {

        const start = unique[i].index;
        const end = unique[i + 1]?.index || text.length;

        const articleText = text.slice(start, end).trim();

        if (articleText.length < 80) continue;

        articles.push({
            article_number: unique[i].num,
            text: articleText,
            source_url: sourceUrl,
            fetched_at: new Date().toISOString()
        });
    }

    // STEP 4: final ordering (VERY IMPORTANT)
    articles.sort((a, b) => a.article_number - b.article_number);

    return articles;
}

module.exports = { extractArticles };