const cheerio = require("cheerio");

function extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);

    const links = [];

    $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        try {
            const full = new URL(href, baseUrl).href;
            links.push(full);
        } catch (e) {}
    });

    return [...new Set(links)];
}

module.exports = { extractLinks };