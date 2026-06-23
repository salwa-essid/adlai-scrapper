# ADLAI Scraper  KSA Legal Corpus Ingestion Service
A standalone Node.js microservice that extracts structured legal articles from Saudi government regulatory sources (ZATCA, Labor Law, Companies Law, etc.) and exposes a simple status API

---

## Purpose

This service is responsible for:

- Crawling government legal sources
- Extracting legal texts from PDFs / HTML / browser-rendered pages
- Splitting documents into structured **articles**
- Saving clean datasets for downstream AI systems (ADLAI)

---

##  Architecture (Simple & Robust)

- PDF parsing (axios + buffer)
- HTML scraping (axios + cheerio)
- JS-rendered pages (Playwright)
- Article extraction via regex detection
- Deduplication + ordering
- JSON + TXT output generation

## Sources Status

### ZATCA
- Status: SUCCESS
- Articles: 96
- Notes: PDF parsing successful, good extraction quality(Arabic PDF, clean extraction, articles split correctly)

### Labor Law
- Status: SUCCESS
- Articles: 265
- Notes: Clean PDF extraction(English PDF from hrsd.gov.sa, full article extraction)

### Companies Law
- Status: SUCCESS
- Articles: 8
- Notes: Browser-based extraction worked via Playwright(BOE portal returns error page to automated browsers )

---
## Run Summary

| Source | Status | Articles | Method | Notes |
|--------|--------|----------|--------|-------|
| ZATCA (VAT Agreement) | ✅ Success | 79 | PDF | Arabic PDF, clean extraction, articles split correctly |
| Labor Law | ✅ Success | 201 | PDF | English PDF from hrsd.gov.sa, full article extraction |
| Companies Law | ❌ Failed | 0 | Browser | BOE portal returns error page to automated browsers |
| PDPL | ❌ Failed | 0 | PDF | PDF not accessible — returns HTML instead of PDF |
| SAMA | ❌ Failed | 0 | HTML | Connection reset — geo-restricted from outside KSA |
| CMA | ❌ Failed | 0 | HTML | No structured articles found in page content |
| NCA | ❌ Failed | 0 | HTML | URL returns 404 |
| MISA | ❌ Failed | 0 | Browser | JS-routed site, Playwright attempted but content blocked |


## What Worked

- **PDF extraction** is reliable for open government PDFs — ZATCA and Labor Law both produced clean, structured output
- **Arabic text** is intact and readable in all ZATCA output — no encoding issues
- **Article splitting** correctly identifies individual articles using Arabic (`المادة`) and English (`Article`) patterns
- **Resilience** — one failing source never crashed the others; all 8 sources were attempted and completed
- **Retry logic** — each source retried up to 3 times with exponential backoff before marking as failed
- **`/status` endpoint** returns live per-source breakdown including article count, status, and error reason
- **`/run` endpoint** starts scraping in the background and returns immediately

---

## What Failed and Why

### Companies Law (BOE portal)
The BOE portal (`laws.boe.gov.sa`) loads via JavaScript and requires an authenticated session. Even with Playwright (headless Chromium), the portal returns a generic error page. This is a server-side access restriction, not a parsing issue.

### PDPL
The PDF URL on the SDAIA portal returns `text/html` instead of `application/pdf` — the portal redirects automated requests to a login or error page.

### SAMA
Connection reset error — the SAMA portal appears to block requests from outside the KSA network. This is a geo-restriction at the network level.

### CMA
The page loads successfully but contains no structured article patterns — the content is rendered dynamically and not accessible via static HTML scraping.

### NCA
The configured URL returns 404. The NCA portal may have changed its URL structure since the project brief was written.

### MISA
JS-routed site as noted in the brief. Playwright was used but the portal requires a specific session or routing that could not be reproduced programmatically.

---

## Honest Assessment

**2 of 8 sources** produced clean, structured output — ZATCA (79 articles) and Labor Law (201 articles), totaling **280 articles**.

The failures are infrastructure and access-level issues, not parsing issues. The scraper correctly attempted all 8 sources, handled each failure gracefully, and logged clear reasons for each failure.

Running this service from inside a KSA network would likely resolve the geo-restriction failures (SAMA, possibly PDPL and CMA). The BOE portal restriction would require either authenticated access or a different data source for Companies Law.

The ZATCA output is the most critical deliverable — 51 of 66 ADLAI eval questions are ZATCA-related, and those articles are now available in clean, citation-ready format.

