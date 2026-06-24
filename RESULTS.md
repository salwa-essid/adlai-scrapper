# RESULTS.md — Scraping Run Report

**Run date:** June 24, 2026 — 11:54 UTC  
**Total articles extracted:** 827  
**Sources attempted:** 11 — **11 success, 0 failed**

---

## Per-Source Results

| Source | Status | Articles | Method | Source URL |
|--------|--------|----------|--------|------------|
| zatca_einvoicing_regulation | ✅ | 7 | multi_pdf (ar + en) | zatca.gov.sa |
| zatca_implementation_resolution | ✅ | 146 | multi_pdf (ar + en) | zatca.gov.sa |
| zatca_guidelines | ✅ | 97 | multi_pdf (ar + en) | zatca.gov.sa |
| zatca_vat_agreement | ✅ | 120 | PDF | zatca.gov.sa |
| labor | ✅ | 187 | PDF | hrsd.gov.sa |
| companies | ✅ | 41 | PDF | qadha.org.sa |
| pdpl | ✅ | 15 | local PDF | input/pdpl.pdf |
| sama | ✅ | 52 | multi_pdf (en) | sama.gov.sa |
| cma | ✅ | 51 | PDF | cma.gov.sa |
| nca | ✅ | 87 | multi_pdf (en) | nca.gov.sa |
| misa | ✅ | 24 | PDF | misa.gov.sa |

---

## ZATCA — Primary Eval Target

51 of 66 ADLAI eval questions target ZATCA e-invoicing. The corpus now contains the three correct documents:

| Document | Articles | Language |
|----------|----------|----------|
| E-Invoicing Regulation | 7 | ar + en |
| Implementation Resolution | 146 | ar + en |
| Detailed Technical Guidelines | 97 | ar + en |
| **Total ZATCA e-invoicing** | **250** | |

The 2016 GCC VAT Agreement is also retained (120 articles) as supplementary reference — it is not the primary eval target.

---

## Honest Assessment of Known Limitations

**companies — 41 articles (expected ~230)**  
The qadha.org.sa PDF has partial text encoding. The authoritative BOE portal blocks automated access (403). A clean text-layer PDF from mc.gov.sa or boe.gov.sa would increase this significantly. Content is real — just incomplete.

**pdpl — 15 articles**  
Sourced from a local PDF (`input/pdpl.pdf`). The sdaia.gov.sa portal blocks automated requests. 15 articles cover the main regulation text but may not include all annexes.

**zatca_einvoicing_regulation — 7 articles**  
This is correct — the regulation itself is a short document (~7 articles by design). The bulk of ZATCA e-invoicing content lives in the resolution (146) and guidelines (97).

**sama — 52 articles, language: unknown**  
Extracted from the English Banking Control Law + Saudi Central Bank Law PDFs from sama.gov.sa. Language detection returned "unknown" due to mixed encoding in the bilingual PDF — the content is real and readable.

---

## What Was Fixed in This Sprint

| Issue | Original | Fixed |
|-------|----------|-------|
| ZATCA source | 2016 GCC VAT Agreement (wrong doc) | 3 correct e-invoicing documents |
| NCA | 1 boilerplate article from homepage | 87 real controls from ECC + CCC PDFs |
| CMA | 13 articles (regex caught cross-references) | 51 correctly bounded articles |
| SAMA | browser scrape timing out (0 articles) | 52 articles from direct PDFs |
| node_modules committed | 3,842 files in repo | removed from version control |
| Single giant commit | no history | incremental commits per fix |
| Dead code | unused fetchers/ and api/ folders | removed |
| .env and .idea/ committed | exposed | removed and gitignored |
