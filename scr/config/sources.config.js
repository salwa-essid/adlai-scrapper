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
        method: "local_pdf",
        language: "ar",
        reverseText: true,
        // MANUAL OVERRIDE 2026-08-18: this PDF's text layer is not
        // uniformly mirrored like labor/sama's — confirmed by running
        // parsePdf() directly against input/pdpl.pdf: some lines are
        // fully reversed, some are already correct, and some individual
        // tokens (esp. punctuation placement) are reversed independently
        // of the rest of their line. A per-line "reverse if it scores
        // more readable" heuristic was tried and still leaves word order
        // wrong on header lines like "المادة الأولى". Rather than ship a
        // fragile regex fix for one PDF, output/pdpl/ is populated from
        // the already hand-verified 43-article extraction (same source
        // PDF, sdaia.gov.sa) done for the adlai-corpus-ingestion repo.
        // manualOverride tells the crawler to skip re-parsing this
        // source and keep the existing output/pdpl/ files as-is — a real
        // parser fix should replace this once someone has time to
        // reverse-engineer the mixed-direction text properly.
        manualOverride: true
    },
    {
        name: "sama",
        // Both old sama.gov.sa URLs were dead (one served a totally
        // different law's text, the other an HTML error page, not a PDF —
        // confirmed 2026-08-03). rulebook.sama.gov.sa (the newer portal)
        // disallows scraping via robots.txt. Found 2026-08-04: SAMA still
        // hosts the actual founding law as a plain static PDF at a
        // completely different, non-portal path —
        // https://www.sama.gov.sa/ar-sa/Documents/SCB_ar.pdf — "نظام
        // البنك المركزي السعودي" (Saudi Central Bank Law, Royal Decree
        // M/36, 1442H). Confirmed reachable and readable (Article 1:
        // definitions of "Bank"/"Regulation"/"Council"/"Governor" etc.),
        // and it's a genuine multi-article statute, not a stub page — a
        // good, direct replacement for the old dead links. Switched back
        // from local_pdf to the normal automated "pdf" method since
        // nothing here needs a manual download anymore.
        //
        // Confirmed 2026-08-11 via /run + output/sama.json: same
        // mirror-reversal corruption as labor/pdpl (raw "م اظن كن ب ل ا
        // يز ك ر م ل ا يدوعسل ا" reverses correctly to "نظام البنك
        // المركزي السعودي"). 11 real, well-structured articles
        // (definitions, governance, monetary policy, closing provisions)
        // once reversed.
        url: "https://www.sama.gov.sa/ar-sa/Documents/SCB_ar.pdf",
        method: "pdf",
        language: "ar",
        reverseText: true
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