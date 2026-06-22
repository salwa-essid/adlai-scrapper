# ADLAI Scraper Results

A standalone Node.js microservice that extracts structured legal articles from Saudi government regulatory sources (ZATCA, Labor Law, Companies Law, etc.).

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
- Notes: PDF parsing successful, good extraction quality

### Labor Law
- Status: SUCCESS
- Articles: 265
- Notes: Clean PDF extraction

### Companies Law
- Status: SUCCESS
- Articles: 8
- Notes: Browser-based extraction worked via Playwright

---

## Failures / Risks

- Sitemap pagination not fully optimized
- Some PDFs contain warning fonts (TT errors)
- Some articles marked as "unknown" when no header detected

---

## Overall Result

Core ingestion pipeline is functional and meets requirements.