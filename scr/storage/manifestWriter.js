const fs = require("fs");
const path = require("path");

function writeManifest(statusMap, sourcesConfig = []) {
    const outputDir = path.join(__dirname, "../../output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const entries = Object.entries(statusMap).map(([name, info]) => {
        const source = sourcesConfig.find(s => s.name === name);
        return {
        name,
        status: info.status,           // success | failed | blocked
        article_count: info.articles || 0,
        language: source?.language || "unknown",
          source_url: source?.url || source?.urls?.[0] || null,
        fetched_at: info.lastUpdated || null
    }});
    const manifest = {
        generated_at: new Date().toISOString(),
        sources: entries
    };
    const manifestPath = path.join(outputDir, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`\nmanifest written → output/manifest.json`);
}

module.exports = { writeManifest };
