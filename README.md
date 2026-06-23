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

Sources are defined in `scr/config/sources.config.js`:

```js
{
    name: "zatca",
    url: "https://...",
    method: "pdf | html | browser | local_pdf"
}
```


### Run with server (recommended)

```bash
node server.js
```

| Endpoint | Description |
|----------|-------------|
| `GET /run` | Start scraping in background (returns immediately) |
| `GET /status` | Check live progress per source |

### Run directly

```bash
node index.js
```

### Run a single source

Edit `scr/config/sources.config.js` to keep only the source you want, then run `node index.js`.

---

## Output

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
├── scr/
│   ├── config/             Sources configuration
│   ├── crawler/            Main orchestrator
│   ├── fetchers/           HTTP (axios) + Browser (Playwright)
│   ├── parsers/            Article extraction + PDF parsing
│   ├── storage/            File writer (JSON + TXT)
│   └── api/                Status state manager
├── input/                  Manually downloaded PDFs
└── output/                 Generated article files
```

---

## Sources Status (Latest Run)

| Source | Status | Articles | Method |
|--------|--------|----------|--------|
| ZATCA (VAT Agreement) | ✅ Success | 109 | PDF |
| Labor Law | ✅ Success | 227 | PDF |
| Companies Law | ✅ Success | 230 | Browser |
| PDPL | ✅ Success | 42 | Local PDF |
| SAMA | ✅ Success | 31 | Browser |
| CMA | ✅ Success | 24 | PDF |
| NCA | ✅ Success | 1 | Browser |
| MISA | ✅ Success | 17 | PDF |

**Total: 681 articles across 8 sources**

See `RESULTS.md` for full details.

---

## Resilience

* One failing source never crashes the others
* Configurable timeout + retry with exponential backoff
* Clear per-source error logging
* `/run` returns immediately — scraping runs in background
* `/status` returns live per-source breakdown at any time
