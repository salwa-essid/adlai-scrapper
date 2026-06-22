const fs = require("fs");
const path = require("path");

function saveOutput(lawType, fullText, articles) {
    const outputDir = path.join(process.cwd(), "output", lawType);

    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
        path.join(outputDir, `${lawType}_full.txt`),
        fullText || "",
        "utf8"
    );

    fs.writeFileSync(
        path.join(outputDir, `${lawType}_articles.json`),
        JSON.stringify(articles, null, 2),
        "utf8"
    );

    console.log(`💾 Saved output/${lawType}`);
}

module.exports = { saveOutput };