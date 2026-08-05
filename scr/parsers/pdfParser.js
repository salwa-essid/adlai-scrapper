//const pdfParse = require("pdf-parse");
const pdfParse = require("pdf-parse/lib/pdf-parse.js")

/**
 * Some Arabic PDFs store their text layer in visual order (the order
 * glyphs are drawn on the page, right-to-left) instead of logical
 * order (the order you'd type them in). pdf-parse doesn't do BiDi
 * reordering, so it hands back each line mirror-imaged — verified on
 * the new SAMA Central Bank Law PDF: "لودج" (should be "جدول", table)
 * came out reversed. Not every Arabic PDF has this problem (companies
 * and the new CMA PDF parse fine without it) — it depends on how the
 * source PDF was generated, so this is opt-in per source
 * (sources.config.js: reverseText: true), not applied automatically.
 * Reversing per-line (not the whole blob) preserves line/paragraph
 * order, which is already correct — only the character order within
 * each line is mirrored.
 */
function reverseArabicLines(text) {
    return text
        .split("\n")
        .map((line) => line.split("").reverse().join(""))
        .join("\n");
}

async function parsePdf(buffer, options = {}) {
    try {
        const data = await pdfParse(buffer);
        console.log(" PDF TEXT LENGTH:", data.text.length);
        if (!data.text || data.text.trim().length < 50) {
            console.log(" PDF looks empty or scanned");
        }
        const text = data.text || "";
        return options.reverseText ? reverseArabicLines(text) : text;
    } catch (err) {
        console.log(" PDF PARSE ERROR:", err.message);
        return "";
    }
}

module.exports = { parsePdf, reverseArabicLines };