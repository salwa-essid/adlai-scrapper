function isGoodContent(text) {
    if (!text) return false;

    if (text.length < 500) return false;

    const badSignals = [
        "loading",
        "cookie",
        "enable javascript",
        "access denied"
    ];

    const lower = text.toLowerCase();

    const bad = badSignals.some(s => lower.includes(s));

    return !bad;
}

module.exports = { isGoodContent };

