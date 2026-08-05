# RESULTS.md — Scraping Run Report

**Run date:** August 5, 2026 — 10:00 UTC
**Total articles extracted:** 709
**Sources attempted:** 11 — **11 success, 0 failed**

---

## Per-Source Results

| Source | Status | Articles | Method | Source URL |
|--------|--------|----------|--------|------------|
| zatca_einvoicing_regulation | ✅ | 7 | multi_pdf (ar + en) | zatca.gov.sa |
| zatca_implementation_resolution | ✅ | 101 | multi_pdf (ar + en) | zatca.gov.sa |
| zatca_guidelines | ✅ | 99 | multi_pdf (ar + en) | zatca.gov.sa |
| zatca_vat_agreement | ✅ | 134 | PDF | zatca.gov.sa |
| labor | ✅ | 64 | PDF | hrsd.gov.sa |
| companies | ✅ | 99 | PDF | qadha.org.sa |
| pdpl | ✅ | 16 | local PDF | input/pdpl.pdf |
| sama | ✅ | 24 | local PDF (ar + en) | manually downloaded, input/sama_banking.pdf |
| cma | ✅ | 66 | PDF | cma.gov.sa |
| nca | ✅ | 87 | multi_pdf (en) | nca.gov.sa |
| misa | ✅ | 12 | PDF | misa.gov.sa |

---

## ZATCA — Primary Eval Target

51 of 66 ADLAI evaluation questions target ZATCA e-invoicing. The corpus contains the three official documents:

| Document | Articles | Language |
|----------|----------|----------|
| E-Invoicing Regulation | 7 | ar + en |
| Implementation Resolution | 101 | ar + en |
| Detailed Technical Guidelines | 99 | ar + en |
| **Total ZATCA e-invoicing** | **207** | |

The 2016 GCC VAT Agreement is also retained (134 articles) as supplementary reference. It is included for completeness but is not the primary evaluation target.

---

## Honest Assessment of Known Limitations

**CMA — 66 of an expected ~67 articles**
The article parser previously only recognized spelled-out Arabic ordinals 1st–10th (المادة الأولى..العاشرة), silently dropping every article past the 10th on documents that don't number articles with digits. Fixed with a compositional ordinal parser covering 1–99. A second, separate bug was found and fixed: the CMA PDF's font encodes the "لأ" (lam+hamza) ligature as a corrupted control byte during text extraction, which broke matching of "الأربعون" (forty) — this had silently merged articles 40–49 into article 39's block. One article (article 2) is still missing from the output and the cause is not yet confirmed — flagged as open, not guessed at.

**Companies — 99 articles (up from a previously reported 42)**
Companies also uses spelled-out Arabic ordinals, not digits as previously assumed — so it was affected by the same 10-article cap as CMA before the ordinal-parser fix. Verified against the real output: all 99 article numbers are unique with no gaps (1–99) and no duplicates, so this is very likely a genuine fix rather than a regression. A few articles appear out of sequential order in the source text (e.g. 47–49 positioned between 22 and 23); this looks like a PDF layout artifact rather than a parsing bug, since it doesn't produce duplicates or gaps.

**Labor, PDPL, MISA — article counts dropped significantly from the last recorded run (labor 295→64, pdpl 49→16, misa 30→12)**
Investigated and confirmed this is **unrelated** to the CMA/companies ordinal-parser fix (labor uses digit-based headers, not spelled ordinals). Root cause found: labor's source PDF requires mirror-reversed-line correction (`reverseText: true`), and this reversal does not correctly handle certain lines (particularly amendment/footnote lines), which corrupts extracted article numbers and appears to cause legitimate articles to be silently dropped by the duplicate-detection logic. This is a distinct, unresolved issue — **not fixed in this sprint**, tracked as follow-up work. Numbers for these three sources should not yet be treated as reliable.

**SAMA — 24 articles**
Previously failing (missing local PDF, ENOENT). Fixed by obtaining and placing the official Banking Control Law PDF (bilingual ar+en) at `input/sama_banking.pdf`, per the source config's documented manual-download requirement.

**ZATCA E-Invoicing Regulation — 7 articles**
Expected — the regulation itself is intentionally short. Most implementation detail is in the Implementation Resolution and the Detailed Technical Guidelines.

---

## What Was Fixed in This Sprint

| Issue | Original | Fixed |
|-------|----------|-------|
| CMA/Companies article parser | Only recognized spelled-out ordinals 1st–10th; anything past 10th silently dropped | Compositional Arabic ordinal parser covering 1–99 |
| CMA PDF text corruption | "لأ" ligature decoded as a stray control byte, breaking "الأربعون" (40) matching and merging articles 40–49 into article 39 | Corrupted bytes normalized back to "لأ" before header matching |
| SAMA | Missing local source PDF (ENOENT) | Official Banking Control Law PDF obtained and placed at `input/sama_banking.pdf` |

## Known Open Issues (not fixed yet)

| Issue | Status |
|-------|--------|
| CMA article 2 missing from output | Cause unconfirmed — needs further investigation, not guessed at |
| Labor/PDPL/MISA article numbering unreliable | Root cause identified (mirror-reversal doesn't handle footnote-style lines correctly); fix not yet implemented |
| Dead code (`scr/api/status.js`, `scr/fetchers/`) | Confirmed present on disk, untracked in git — needs manual deletion |
| Large uncommitted change set | Needs to be split into incremental, meaningful commits per source/fix rather than one large commit |

---

## Output Summary

The scraper produces:

- Structured article JSON for every supported source.
- `output/manifest.json` summarizing corpus metadata for downstream ingestion.
- Consistent success/failure reporting for every source.

Labor, PDPL, and MISA article-level data should be treated as unreliable until the mirror-reversal/footnote-line issue is resolved. All other sources are verified against real output data.