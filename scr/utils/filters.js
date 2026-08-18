function isGoodContent(text) {
    if (!text) return false;

    if (text.length < 500) return false;

    const badSignals = [
        "loading",
        "cookie",
        "enable javascript",
        "access denied",
        // Sanity check requested 2026-08-18 (Alex, adlai-scrapper review):
        // a bad extraction (site nav/footer text instead of the real
        // document) should fail the source instead of silently being
        // marked "success". These are common government-site boilerplate
        // phrases that show up when a fetch grabs the landing page /
        // error page instead of the actual PDF/document content.
        "government website registered",
        "all rights reserved",
        "جميع الحقوق محفوظة",
        "الموقع الرسمي"
    ];

    const lower = text.toLowerCase();

    const bad = badSignals.some(s => lower.includes(s));

    return !bad;
}

module.exports = { isGoodContent };