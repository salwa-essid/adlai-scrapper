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

// Arabic ordinals for "أولاً، ثانياً..." used in Resolution docs
const ARABIC_ORDINALS = [
    "أولاً","ثانياً","ثالثاً","رابعاً","خامساً","سادساً","سابعاً","ثامناً","تاسعاً","عاشراً"
];

function extractArticles(rawText, sourceUrl) {
    const text = rawText?.trim()?.startsWith("<")
        ? cleanHtml(rawText)
        : (rawText || "")
            .replace(/\r/g, "")
            .replace(/[ \t]+/g, " ")
            .trim();
    console.log("NEWLINES:", (text.match(/\n/g) || []).length);

    if (!text || text.length < 200) return [];

    // Pattern 1: Standard article headings — Arabic & English
    // Must be at word boundary, NOT preceded by prepositions (of, من, في, بموجب...)
    // Requires a colon, newline, or double-space after the number (not mid-sentence)
    const articlePattern =
        /(?<![a-zA-Z\u0600-\u06FF\d،,])(المادة\s+(?:\d+|الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة)(?:\s*[-–:]|\s{2,}|\s*\n))/gim;

    // Pattern 2: Arabic ordinals used in Resolution (أولاً: ثانياً: ...)
    const ordinalPattern = new RegExp(
        `(?<![\\u0600-\\u06FF])(${ARABIC_ORDINALS.join("|")})\\s*[:\\-]`,
        "gim"
    );

    // Pattern 3: Numbered sections for Guidelines (5.1 / 5.2 / 6.1 etc.)
    // Only at start of a logical block — preceded by space or start, followed by a letter/Arabic char
    const sectionPattern =
        /(?:^|\s)(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)\s*[.\-–]\s*(?=[\u0600-\u06FFa-zA-Z])/gim;

    // Collect all matches with their index and a label
    let allMatches = [];

    for (const m of text.matchAll(articlePattern)) {
        allMatches.push({ index: m.index, label: m[0].trim(), type: "article" });
    }
    for (const m of text.matchAll(ordinalPattern)) {
        allMatches.push({ index: m.index, label: m[0].trim(), type: "ordinal" });
    }
    for (const m of text.matchAll(sectionPattern)) {
        allMatches.push({ index: m.index, label: m[1].trim(), type: "section" });
    }

    // Sort by position
    allMatches.sort((a, b) => a.index - b.index);

    // Deduplicate overlapping matches (keep earliest)
    const deduped = [];
    let lastEnd = -1;
    for (const m of allMatches) {
        if (m.index >= lastEnd) {
            deduped.push(m);
            lastEnd = m.index + m.label.length;
        }
    }

    console.log(`DEBUG matches found: ${deduped.length} (article:${allMatches.filter(m=>m.type==="article").length}, ordinal:${allMatches.filter(m=>m.type==="ordinal").length}, section:${allMatches.filter(m=>m.type==="section").length})`);

    if (deduped.length === 0) {
        console.log("no article markers found → fallback mode");
        const fallbackBlocks = text
            .split(/\n{2,}|(?=\d+\.)|(?=Chapter\s)/gi)
            .map(t => t.trim())
            .filter(t => t.length > 120);
        return fallbackBlocks.map((block, i) => ({
            article_number: i + 1,
            language: detectLanguage(block),
            text: block,
            source_url: sourceUrl,
            fetched_at: new Date().toISOString()
        }));
    }

    const articles = [];
    const seen = new Set();

    for (let i = 0; i < deduped.length; i++) {
        const start = deduped[i].index;
        const end = deduped[i + 1]?.index || text.length;
        let block = text.slice(start, end).trim();
        block = block.replace(/\s+/g, " ").trim();

        if (block.length < 50) continue;

        // Build a unique article_number based on type + label
        let articleNumber;
        if (deduped[i].type === "article") {
            const numMatch = deduped[i].label.match(/\d+/);
            articleNumber = numMatch ? parseInt(numMatch[0]) : i + 1;
        } else if (deduped[i].type === "ordinal") {
            const idx = ARABIC_ORDINALS.findIndex(o => deduped[i].label.startsWith(o));
            articleNumber = idx + 1;
        } else {
            articleNumber = deduped[i].label; // "5.1", "6.2" etc.
        }

        // Deduplicate within same source_url + type
        const key = `${sourceUrl}::${deduped[i].type}::${articleNumber}`;
        if (seen.has(key)) continue;
        seen.add(key);

        articles.push({
            article_number: articleNumber,
            article_type: deduped[i].type,
            language: detectLanguage(block),
            text: block,
            source_url: sourceUrl,
            fetched_at: new Date().toISOString()
        });
    }

    return articles;
}

module.exports = { extractArticles };
