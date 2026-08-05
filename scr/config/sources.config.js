module.exports = [
    // ZATCA E-Invoicing — each document gets its own output folder
    {
        name: "zatca_einvoicing_regulation",
        urls: [
            "https://zatca.gov.sa/ar/E-Invoicing/Introduction/LawsAndRegulations/Documents/E-invoicing-Regulations.pdf",
            "https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Documents/E-invoicing%20Regulation%20EN.pdf"
        ],
        docLabels: ["ar", "en"],
        method: "multi_pdf",
        language: "ar,en"
    },
    {
        name: "zatca_implementation_resolution",
        urls: [
            "https://zatca.gov.sa/ar/E-Invoicing/Introduction/LawsAndRegulations/Documents/20230519_E-Invoicing%20Resolution.pdf",
            "https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Documents/20230519_E-Invoicing%20Implementation%20Resolution%20English.pdf"
        ],
        docLabels: ["ar", "en"],
        method: "multi_pdf",
        language: "ar,en"
    },
    {
        name: "zatca_guidelines",
        urls: [
            "https://zatca.gov.sa/ar/E-Invoicing/Introduction/Guidelines/Documents/E-Invoicing-Detailed-Guidelines.pdf",
            "https://zatca.gov.sa/en/E-Invoicing/Introduction/Guidelines/Documents/E-Invoicing_Detailed__Guideline.pdf"
        ],
        docLabels: ["ar", "en"],
        method: "multi_pdf",
        language: "ar,en"
    },
    // VAT Agreement(optional)
    {
        name: "zatca_vat_agreement",
        url: "https://zatca.gov.sa/ar/RulesRegulations/Taxes/Documents/VAT%20Final%2030%20Nov%202016(updated).pdf",
        method: "pdf",
        language: "ar,en"
    },
    {
        name: "labor",
        // Was pointing at the 2023-02 English translation despite
        // language: "ar" already being set here — verified by hand that
        // 100% of the ingested articles came back English. This is the
        // Arabic original (newer revision too: 2025-02 vs 2023-02).
        url: "https://www.hrsd.gov.sa/sites/default/files/2025-02/%D9%86%D8%B8%D8%A7%D9%85%20%D8%A7%D9%84%D8%B9%D9%85%D9%84.pdf",
        method: "pdf",
        language: "ar",
        // Confirmed 2026-08-03 via raw-dump diagnostic (dump-raw-labor-pdpl.js):
        // this PDF's text is uniformly mirror-reversed line by line, same
        // corruption pattern as SAMA's original PDF. Verified against the
        // recurring header phrase: raw "ماظن لمعل ا" reverses correctly to
        // "نظام العمل". reverseText fixes it the same way as SAMA.
        reverseText: true
    },
    {
        name: "companies",
        url: "https://qadha.org.sa/files/3/%D9%83%D8%AA%D8%A8%20%D9%82%D8%B6%D8%A7%D8%A1/%D9%86%D8%B8%D8%A7%D9%85%20%D8%A7%D9%84%D8%B4%D8%B1%D9%83%D8%A7%D8%AA%20%D9%88%D9%84%D9%88%D8%A7%D8%A6%D8%AD%D9%87%20%D8%A7%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%D9%8A%D8%A9.pdf",
        method: "pdf",
        language: "ar"
    },
    {
        name: "pdpl",
        url: "./input/pdpl.pdf",
        method: "local_pdf"
    },
    {
        name: "sama",
        // Both old sama.gov.sa URLs are dead (one now serves a totally
        // different law's text, the other returns an HTML error page,
        // not a PDF — confirmed 2026-08-03, the site was restructured).
        // SAMA now publishes law text per-article on rulebook.sama.gov.sa,
        // which disallows scraping (robots.txt). Interim fix: manually
        // downloaded PDF, same pattern as pdpl below. Drop this file at
        // input/sama_banking.pdf before running the crawler.
        url: "./input/sama_banking.pdf",
        method: "local_pdf",
        language: "ar"
    },
    {
        name: "cma",
        // language: "en" was set on purpose here, but that's the gap —
        // this repo needs the Arabic original, not a translation. Same
        // URL with "/en/" removed (verified against cma.gov.sa's own
        // Arabic law page).
        url: "https://cma.gov.sa/RulesRegulations/CMALaw/Documents/CMA_Law.pdf",
        method: "pdf",
        language: "ar"
    },
    {
        name: "nca",
        // Both URLs were the "-en" variant on purpose (language: "en").
        // nca.gov.sa serves the Arabic originals at the same path with
        // "-ar" instead of "-en" — verified both by hand (ECC and CCC
        // controls, correctly in Arabic).
        urls: [
            "https://nca.gov.sa/ecc-ar.pdf",
            "https://nca.gov.sa/ccc-ar.pdf"
        ],
        docLabels: ["ecc", "ccc"],
        method: "multi_pdf",
        language: "ar"
    },
    {
        name: "misa",
        // The 2025/07 URL was English-only. Found a newer (2024/1446H),
        // bilingual PDF instead — Arabic text first, English translation
        // after, per article (verified 2026-08-03). Not a clean ar/en
        // split like zatca's multi_pdf sources, so each extracted
        // article's text will likely contain both languages run
        // together — better than 100% English, but flag for a spot
        // check once ingested (extractArticles wasn't written with
        // bilingual-single-PDF sources in mind).
        url: "https://misa.gov.sa/app/uploads/2024/08/Investment-Law.pdf",
        method: "pdf",
        language: "ar,en"
    }
];
