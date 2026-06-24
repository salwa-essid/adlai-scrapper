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
        url: "https://www.hrsd.gov.sa/sites/default/files/2023-02/Labor.pdf",
        method: "pdf",
        language: "ar"
    },
    {
        name: "companies",
        url: "https://qadha.org.sa/files/3/%D9%83%D8%AA%D8%A8%20%D9%82%D8%B6%D8%A7%D8%A1/%D9%86%D8%B8%D8%A7%D9%85%20%D8%A7%D9%84%D8%B4%D8%B1%D9%83%D8%A7%D8%AA%20%D9%88%D9%84%D9%88%D8%A7%D8%A6%D8%AD%D9%87%20%D8%A7%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%D9%8A%D8%A9.pdf",
        method: "pdf",
        language: "ar"
    },
    {
        name: "pdpl",
        // sdaia.gov.sa
        url: "https://sdaia.gov.sa/ar/SDAIA/about/Documents/PersonalData.pdf",
        method: "pdf",
        language: "ar"
    },
    {
        name: "sama",
        url: "https://rulebook.sama.gov.sa/ar/نظام-مراقبة-البنوك",
        method: "browser",
        language: "ar"
    },
    {
        name: "cma",
        url: "https://cma.gov.sa/en/RulesRegulations/CMALaw/Documents/CMA_Law.pdf",
        method: "pdf",
        language: "en"
    },
    {
        name: "nca",
        // directly pdfs  nca.gov.sa — ECC و CCC
        urls: [
            "https://nca.gov.sa/ecc-en.pdf",
            "https://nca.gov.sa/ccc-en.pdf"
        ],
        docLabels: ["ecc", "ccc"],
        method: "multi_pdf",
        language: "en"
    },
    {
        name: "misa",
        url: "https://misa.gov.sa/app/uploads/2025/07/Investment-Law.pdf",
        method: "pdf",
        language: "en"
    }
];
