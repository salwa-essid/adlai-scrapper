# ADLAI Scraper — KSA Legal Corpus Ingestion Service

A standalone Node.js microservice that extracts structured legal articles from Saudi government regulatory sources and exposes a simple status API.

---

## Purpose

This service is responsible for:

* Crawling government legal sources
* Extracting legal texts from PDFs, HTML, and browser-rendered pages
* Splitting documents into structured legal articles
* Producing clean datasets for downstream AI systems (ADLAI)
* Providing runtime status monitoring via API

---

## Installation

```bash
npm install
npx playwright install chromium
```

---

## Configuration

Sources are defined in `scr/config/sources.config.js`. Each source has:

```js
{
    name: "zatca",
    url: "https://...",
    method: "pdf | html | browser | local_pdf"
}
```

To add or change a source, edit this file only — no code changes needed.

---

## Usage

### Run with server (recommended)

```bash
node server.js
```

| Endpoint | Description |
|----------|-------------|
| `GET /run` | Start scraping in background (returns immediately) |
| `GET /status` | Check live progress per source |

### Run directly (no server)

```bash
node index.js
```

### Run a single source

Edit `scr/config/sources.config.js` to keep only the source you want, then run `node index.js`.

---

## Output

Results are saved to:

```
output/
├── zatca/
│   ├── zatca_articles.json
│   └── zatca_full.txt
├── labor/
│   ├── labor_articles.json
│   └── labor_full.txt
└── ...
```

Each article in JSON:

```json
{
  "article_number": 1,
  "text": "...",
  "source_url": "https://...",
  "fetched_at": "2026-06-23T07:50:00.000Z"
}
```

---

## Architecture

```
adlai-scraper/
├── server.js               Express server (/run + /status)
├── index.js                Direct runner
├── scr/
│   ├── config/             Sources configuration
│   ├── crawler/            Main orchestrator
│   ├── fetchers/           HTTP (axios) + Browser (Playwright)
│   ├── parsers/            Article extraction + PDF parsing
│   ├── storage/            File writer (JSON + TXT)
│   └── api/                Status state manager
├── input/                  Manually downloaded PDFs (if needed)
└── output/                 Generated article files
```

---

## Sources Status (Latest Run)

| Source | Status | Articles | Method | Notes |
|--------|--------|----------|--------|-------|
| ZATCA (VAT Agreement) | ✅ Success | 109 | PDF | Clean Arabic extraction |
| Labor Law | ✅ Success | 227 | PDF | English PDF from hrsd.gov.sa |
| Companies Law | ✅ Success | 230 | Browser | Playwright extraction from BOE portal |
| PDPL | ✅ Success | 42 | Local PDF | Manual download required — portal blocks automated access |
| SAMA | ✅ Success | 31 | Browser | Playwright from rulebook.sama.gov.sa |
| CMA | ✅ Success | 24 | PDF | PDF from cma.gov.sa |
| NCA | ✅ Success | 1 | Browser | Page loads but minimal structured content |
| MISA | ✅ Success | 17 | PDF | Investment Law PDF from misa.gov.sa |

**Total: 681 articles across 8 sources**

See `RESULTS.md` for full details.

---

## Resilience

* One failing source never crashes the others
* Configurable timeout + retry with exponential backoff
* Clear per-source error logging (timeout / empty content / parse error)
* `/run` returns immediately — scraping runs in background
* `/status` returns live per-source breakdown at any time