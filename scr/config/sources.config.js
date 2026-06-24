module.exports = [
    // {
    //     name: "zatca",
    //     // مصادر متعددة تُجمع في output/zatca واحد
    //     urls: [
    //         "https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Documents/20230519_E-Invoicing%20Implementation%20Resolution%20English.pdf",
    //         "https://zatca.gov.sa/en/E-Invoicing/Introduction/Guidelines/Documents/E-Invoicing_Detailed__Guideline.pdf"
    //     ],
    //     method: "multi_pdf"
    // },
    {
        name: "zatca",
        url: "https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Pages/default.aspx",
        method: "browser"
    },
    {
        name: "labor",
        url: "https://www.hrsd.gov.sa/sites/default/files/2023-02/Labor.pdf",
        method: "pdf"
    },
    {
        name: "companies",
        url: "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/a8376aea-1bc3-49d4-9027-aed900b555af/1",
        method: "browser"
    },
    {
        name: "pdpl",
        url: "./input/pdpl.pdf",
        method: "local_pdf"
    },
    {
        name: "sama",
        url: "https://rulebook.sama.gov.sa/ar/نظام-مراقبة-البنوك",
        method: "browser"
    },
    {
        name: "cma",
        url: "https://cma.gov.sa/en/RulesRegulations/CMALaw/Documents/CMA_Law.pdf",
        method: "pdf"
    },

    {
        name: "nca",
        url: "https://nca.gov.sa/en/regulatory-documents/",
        method: "browser"
    },
    {
        name: "misa",
        url: "https://misa.gov.sa/app/uploads/2025/07/Investment-Law.pdf",
        method: "pdf"
    },
];