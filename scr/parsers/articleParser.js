const cheerio = require("cheerio");

function cleanHtml(html) {
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, nav, footer, header, aside").remove();
    return $("body")
        .text()
        .replace(/\s+/g, " ")
        .replace(/[\u200B-\u200F\uFEFF]/g, "")
        .replace(/ـ+/g, "")
        .trim();
}
function detectLanguage(text) {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (text.match(/[A-Za-z]/g) || []).length;

    return arabicChars > latinChars ? "ar" : "en";
}
function extractArticles(rawText, sourceUrl) {
    const text = rawText?.trim()?.startsWith("<")
        ? cleanHtml(rawText)
        : (rawText || "").replace(/\s+/g, " ").trim();

    if (!text || text.length < 300) return [];

    const pattern =
        /(المادة\s+(?:\d+|الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة)|Article\s*[\(\[]?\s*\d+\s*[\)\]]?)/gi;
    const matches = [...text.matchAll(pattern)];
    console.log('slawaaa',
        text.match(/المادة\s+\S+/g)?.slice(0, 20)
    );

    if (matches.length === 0) return [];

    const articles = [];

    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = matches[i + 1]?.index || text.length;

        let block = text.slice(start, end).trim();

        block = block
            .replace(/\s+/g, " ")
            .replace(/(\. ){2,}/g, ". ")
            .trim();

        if (block.length < 50) continue;

        articles.push({
            article_number: parseInt(matches[i][2]),
            language: detectLanguage(block),
            text: block,
            source_url: sourceUrl,
            fetched_at: new Date().toISOString()
        });
    }

    return articles;
}

module.exports = { extractArticles };