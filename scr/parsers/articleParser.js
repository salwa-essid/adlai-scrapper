function extractArticles(html) {

    const clean = html
        // remove scripts/styles
        .replace(/<script[^>]*>.*?<\/script>/gs, "")
        .replace(/<style[^>]*>.*?<\/style>/gs, "")

        // remove navigation noise
        .replace(/<nav[^>]*>.*?<\/nav>/gs, "")
        .replace(/<header[^>]*>.*?<\/header>/gs, "")
        .replace(/<footer[^>]*>.*?<\/footer>/gs, "");

    // get visible text only
    const text = clean
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    // split into chunks (this is your "articles")
    const chunks = [];
    let index = 1;

    for (let i = 0; i < text.length; i += 400) {
        const chunk = text.slice(i, i + 400);

        if (chunk.length > 50) {
            chunks.push({
                article_number: index++,
                language: "en",
                text: chunk
            });
        }
    }

    return chunks;
}