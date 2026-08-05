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

// Feminine Arabic ordinals for "المادة <ordinal>" headings (المادة is
// feminine, so law text uses الأولى/الثانية/... not الأول/الثاني/...).
// BUG FIXED 2026-08-05: the previous version of this file only listed
// ordinals 1st-10th (الأولى..العاشرة). Any law with more than 10
// articles written with spelled-out ordinals (not digits) silently lost
// every article past the 10th — reproduced on the real CMA Capital
// Market Law PDF: raw text has "المادة السابعة والستون" (Article 67) as
// its last real article, but the old pattern extracted only 8 articles
// total. Saudi legal documents build ordinals compositionally past 10
// (11 = "الحادية عشرة", 21 = "الحادية والعشرون", 63 = "الثالثة
// والستون", ...) the same way English builds "twenty-first" — this
// covers 1-99 compositionally instead of hardcoding a long flat list,
// which would need updating again for every article count.
const MADDA_ONES = { "الأولى": 1, "الحادية": 1, "الثانية": 2, "الثالثة": 3, "الرابعة": 4, "الخامسة": 5, "السادسة": 6, "السابعة": 7, "الثامنة": 8, "التاسعة": 9 };
const MADDA_TEENS = { "العاشرة": 10, "الحادية عشرة": 11, "الثانية عشرة": 12, "الثالثة عشرة": 13, "الرابعة عشرة": 14, "الخامسة عشرة": 15, "السادسة عشرة": 16, "السابعة عشرة": 17, "الثامنة عشرة": 18, "التاسعة عشرة": 19 };
const MADDA_TENS = { "العشرون": 20, "الثلاثون": 30, "الأربعون": 40, "الخمسون": 50, "الستون": 60, "السبعون": 70, "الثمانون": 80, "التسعون": 90 };

// All recognised ordinal phrases, longest-first so e.g. "الحادية عشرة"
// (11) matches before the bare ones-word "الحادية" would grab just the
// "1" part and leave "عشرة" dangling.
const MADDA_ORDINAL_PHRASES = [
    ...Object.keys(MADDA_TEENS),
    ...Object.keys(MADDA_ONES).flatMap((o) => Object.keys(MADDA_TENS).map((t) => `${o} و${t}`)), // "الثالثة والستون" (63)
    ...Object.keys(MADDA_TENS),
    ...Object.keys(MADDA_ONES)
].sort((a, b) => b.length - a.length);

function parseMaddaOrdinal(phraseRaw) {
    const phrase = phraseRaw.trim().replace(/\s+/g, " ");
    if (MADDA_TEENS[phrase] !== undefined) return MADDA_TEENS[phrase];
    if (MADDA_TENS[phrase] !== undefined) return MADDA_TENS[phrase];
    const compound = phrase.match(/^(.+?)\s+و(.+)$/);
    if (compound && MADDA_ONES[compound[1]] !== undefined && MADDA_TENS[compound[2]] !== undefined) {
        return MADDA_TENS[compound[2]] + MADDA_ONES[compound[1]];
    }
    if (MADDA_ONES[phrase] !== undefined) return MADDA_ONES[phrase];
    return null;
}

// PDF-EXTRACTION CORRUPTION FIX 2026-08-05: some source PDFs (confirmed:
// CMA Capital Market Law) have a broken font/ligature table for "لأ"
// (lam + hamza-alef). pdf-parse decodes that ligature as a single stray
// control character (U+0011 and U+009B both confirmed in real output)
// instead of the two real Arabic letters. This silently broke matching
// of "الأربعون" (40) and "الأولى" (1) article headers — neither the
// correct word nor a digit was present in the extracted text — so
// articles 40-49 got swallowed into article 39's block (its text block
// alone was 9252 chars vs. ~500 average) and article 1 was lost
// entirely. Verified against a real output/cma/cma_articles.json run:
// 240/240 occurrences of these control chars sit exactly where "لأ" is
// grammatically expected (after "ا" for "ال"+"أ", after "و" for
// "و"+"أ", after a space for a bare "ل"+"أ" prefix) — 0 occurrences in
// companies_articles.json, confirming this is a source-specific PDF
// font issue, not a general corruption. Safe to restore mechanically
// (unlike the kashida/repeated-letter corruption seen elsewhere, this
// is a consistent 1:1 substitution, not lossy repetition).
// NOTE: article 2 ("الثانية") went missing in the same CMA run but does
// NOT contain "لأ" — its cause is still unconfirmed, left as-is rather
// than guessed at.
const CORRUPTED_LAM_HAMZA = /[\u0011\u009B]/g;

function extractArticles(rawText, sourceUrl) {
    let text = rawText?.trim()?.startsWith("<")
        ? cleanHtml(rawText)
        : (rawText || "")
            .replace(/\r/g, "\n")          // normalize CR
            .replace(/[ \t]+/g, " ")       // collapse spaces
            .replace(/(Article\s+\d+)/gi, "\n$1")
            .replace(/(المادة\s+)/g, "\n$1")
            .trim();
    text = text.replace(CORRUPTED_LAM_HAMZA, "لأ");
    console.log("NEWLINES:", (text.match(/\n/g) || []).length);



    if (!text || text.length < 200) return [];

    // Pattern 1: Standard article headings — Arabic & English
    // Must be at word boundary, NOT preceded by prepositions (of, من, في, بموجب...)
    // Requires a colon, newline, or double-space after the number (not mid-sentence)
    const articlePattern = new RegExp(
        `(?<![a-zA-Z\\u0600-\\u06FF\\d،,])(الماد[ةه]\\s+(?:\\d+|${MADDA_ORDINAL_PHRASES.join("|")})(?:\\s*[-–:]|\\s{2,}|\\s*\\n))`,
        "gim"
    );

    // Pattern 2: Arabic ordinals used in Resolution (أولاً: ثانياً: ...)
    const ordinalPattern = new RegExp(
        `(?<![\\u0600-\\u06FF])(${ARABIC_ORDINALS.join("|")})\\s*[:\\-]`,
        "gim"
    );

    // Pattern 3: Numbered sections for Guidelines (5.1 / 5.2 / 6.1 etc.)
    // Only at start of a logical block — preceded by space or start, followed by a letter/Arabic char
    const sectionPattern =
        /(?:^|\s)(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)\s*[.\-–]\s*(?=[\u0600-\u06FFa-zA-Z])/gim;

    // Pattern 4: same numbered sections, but with NO punctuation after
    // the number ("1.1 نوع الفاتورة" instead of "1.1. نوع الفاتورة") —
    // zatca_implementation_resolution uses this style; zatca_guidelines
    // uses the punctuated form above. Anchored strictly to the START OF
    // A LINE (^ with the m flag), NOT just "after any whitespace" like
    // Pattern 3 — a plain "after whitespace" version was tried first and
    // caused false-positive splits on ordinary decimal numbers embedded
    // mid-sentence in prose (e.g. a percentage like "5.2 بالمئة"),
    // since those are never preceded by punctuation. Real section
    // headings sit on their own line after PDF extraction; incidental
    // numbers in running prose don't. Found + fixed 2026-08-04 — see
    // test-section-fix.js for the verification this doesn't regress
    // zatca_guidelines and doesn't reintroduce the prose false-positive.
    const sectionPatternLineStart =
        /^(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)\s+(?=[\u0600-\u06FFa-zA-Z])/gim;

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
    for (const m of text.matchAll(sectionPatternLineStart)) {
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
            if (numMatch) {
                articleNumber = parseInt(numMatch[0]);
            } else {
                // No digit → spelled-out ordinal (المادة الثالثة والستون).
                // BUG FIXED 2026-08-05: this used to fall back to the
                // loop position (i + 1), which is only right by luck
                // (when nothing upstream was skipped/merged). Parse the
                // actual ordinal word so the number reflects what the
                // law really says, not just "the Nth match we found".
                const ordinalText = deduped[i].label.replace(/^الماد[ةه]\s+/, "").replace(/[-–:\s]+$/, "");
                const parsed = parseMaddaOrdinal(ordinalText);
                articleNumber = parsed !== null ? parsed : i + 1; // last-resort fallback only if truly unparseable
            }
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