function cleanText(html) {

    if (!html) return "";
    return html
        // remove scripts/styles
        .replace(/<script[^>]*>.*?<\/script>/gs, "")
        .replace(/<style[^>]*>.*?<\/style>/gs, "")

        // remove structural noise
        .replace(/<nav[^>]*>.*?<\/nav>/gs, "")
        .replace(/<header[^>]*>.*?<\/header>/gs, "")
        .replace(/<footer[^>]*>.*?<\/footer>/gs, "")
        .replace(/<form[^>]*>.*?<\/form>/gs, "")

        // remove common ZATCA / gov noise blocks
        .replace(/Loading\.\.\./gi, "")
        .replace(/Voice Commands/gi, "")
        .replace(/Font Size/gi, "")
        .replace(/Greyscale Mode/gi, "")
        .replace(/Login/gi, "")
        .replace(/Contact Us/gi, "")
        .replace(/Cookies?[^.]{0,200}/gi, "")

        // remove HTML tags
        .replace(/<[^>]+>/g, " ")

        // normalize spaces
        .replace(/\s+/g, " ")
        .trim();
}

module.exports = { cleanText };