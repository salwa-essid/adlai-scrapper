# ADLAI Scraper — KSA Legal Corpus Ingestion Service

A standalone Node.js microservice that extracts structured legal articles from Saudi government regulatory sources and exposes a simple status API.

---

## Purpose

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

All sources are defined in `scr/config/sources.config.js`. Each entry specifies:

```js
{
    name: "source_name",          // determines output folder name
    url:  "https://...",          // single URL
    // or:
    urls: ["https://...", "..."], // multiple PDFs merged under one source
    docLabels: ["label1", "label2"],
    method: "pdf | multi_pdf | browser | local_pdf | blocked"
}
```

To add, remove, or change a source — edit this file only. No code changes needed.

---


## Running

### Start the server

```bash
node server.js
```

| Endpoint | Description |
|----------|-------------|
| `GET /run` | Start scraping all sources in background (returns immediately) |
| `GET /status` | Live per-source progress, article counts, and errors |

### Run a single source

Comment out all other entries in `sources.config.js`, then hit `GET /run`.

---

## Output

```
output/
├── manifest.json                                  ← summary of all sources (ADLAI reads this first)
├── zatca_einvoicing_regulation/
│   ├── zatca_einvoicing_regulation_articles.json
│   └── zatca_einvoicing_regulation_full.txt
├── zatca_implementation_resolution/
├── zatca_guidelines/
├── zatca_vat_agreement/
├── labor/
├── companies/
├── pdpl/
├── sama/
├── cma/
├── nca/
└── misa/
```

Each article entry in the JSON:

```json
{
  "article_number": 1,
  "language": "ar",
  "text": "...",
  "source_url": "https://...",
  "fetched_at": "2026-06-24T11:53:38.745Z"
}
```

For `multi_pdf` sources, each article also carries:
```json
{
  "source_doc": "regulation",
  "global_index": 3
}
```

`manifest.json` is written after every run and lists `status`, `article_count`, and `source_url` per source.

---

## Architecture

```
adlai-scraper/
├── server.js                        Express server — /run + /status
├── scr/
│   ├── config/sources.config.js     All source definitions (edit here to add sources)
│   ├── crawler/crawler.js           Main orchestrator — loops sources, handles all methods
│   ├── parsers/
│   │   ├── articleParser.js         Article splitting — supports Arabic, English, ordinals, sections
│   │   ├── pdfParser.js             PDF text extraction (pdf-parse)
│   │   └── fetcher.js               HTTP download with retry
│   ├── storage/
│   │   ├── fileWriter.js            Writes _articles.json + _full.txt per source
│   │   └── manifestWriter.js        Writes output/manifest.json after each run
│   └── utils/                       Retry logic, logging, text cleaning
├── input/                           Manually downloaded PDFs (pdpl, cma)
└── output/                          Generated at runtime — gitignored
```

---

## Resilience

- One failing source never stops the others — each runs in an isolated try/catch
- Configurable retry with exponential backoff per source
- Sources with `method: "blocked"` are skipped cleanly and reported in manifest
- `/status` and `manifest.json` always reflect the true state — including failures and reasons
