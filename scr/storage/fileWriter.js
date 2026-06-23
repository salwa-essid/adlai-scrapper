const fs = require("fs");
const path = require("path");

function saveData(name, articles) {
    const dir = path.join(__dirname, "../../output", name);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const jsonPath = path.join(dir, `${name}_articles.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(articles, null, 2), "utf-8");
    const txtPath = path.join(dir, `${name}_full.txt`);
    const fullText = articles.map(a =>
        `=== المادة ${a.article_number} ===\n${a.text}`
    ).join("\n\n");
    fs.writeFileSync(txtPath, fullText, "utf-8");
    console.log(`Saved ${articles.length} articles to output/${name}/`);
}

module.exports = { saveData };