function isBad(link) {
    return (
        !link ||
        link.includes("login") ||
        link.includes("contact") ||
        link.includes("privacy") ||
        link.includes("terms") ||
        link.includes("#") ||
        link.startsWith("javascript:") ||
        link.includes("readspeaker")
    );
}

function isAllowed(link) {
    return (
        link &&
        (link.includes("zatca.gov.sa") || link.includes("gov.sa")) &&
        !isBad(link)
    );
}

/**
 * Clean content quality filter
 */
function isGoodContent(text, url) {
    if (!text || typeof text !== "string") return false;
    const cleanText = text.toLowerCase();
    const badPatterns = [
        "loading",
        "search",
        "voice commands",
        "font size",
        "greyscale",
        "login",
        "contact us",
        "not found",
        "error",
        "copyright",
        "all rights reserved",
        "menu",
        "navigation"
    ];
    // reject noisy pages
    if (badPatterns.some(p => cleanText.includes(p))) {
        return false;
    }
    // remove ultra short pages (noise)
    if (text.trim().length < 800) {
        return false;
    }
    // optional: reject pages that are mostly UI boilerplate
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 120) {
        return false;
    }
    return true;
}

module.exports = {
    isAllowed,
    isGoodContent,
    isBad
};