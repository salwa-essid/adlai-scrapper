//const pdfParse = require("pdf-parse");
const pdfParse = require("pdf-parse/lib/pdf-parse.js")

async function parsePdf(buffer) {
    try {
        const data = await pdfParse(buffer);

        console.log("📄 PDF TEXT LENGTH:", data.text.length);

        if (!data.text || data.text.trim().length < 50) {
            console.log("⚠️ PDF looks empty or scanned");
        }

        return data.text || "";
    } catch (err) {
        console.log("❌ PDF PARSE ERROR:", err.message);
        return "";
    }
}

module.exports = { parsePdf };