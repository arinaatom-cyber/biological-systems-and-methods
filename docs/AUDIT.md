# Full audit — Biological Systems and Methods (BSM)

Date: 2026-07-21  
Commands: `python tools/audit_site.py` · `python tools/revision_check.py`

## Verdict

**Public showcase is honest and loadable.** No fake articles, editors, ISSN, or live DOI.  
Critical public DOI placeholders cleared. Remaining medium: article-types descriptions are RU-first.

| Area | Result |
|------|--------|
| Brand EN/RU/BSM | OK |
| Stats = 0 / ISSN null | OK |
| Empty articles / bodies / editors | OK |
| Conference gated off | OK |
| Planned licence (not applied) | OK |
| Editorial policies nav / retractions | OK |
| chat.launcher i18n | OK |
| Broken local HTML links | OK |
| Private inbox not web-served | OK |
| Manuscript template | OK (`templates/BSM-manuscript-template.docx`) |
| Fake DOI in public UI | Cleared |
| Article-types EN/ZH bodies | Medium — pending |
| OJS live | Not yet (`submissionMode: local`) |

## Site map vs plan

| Planned section | Status |
|-----------------|--------|
| Home | Live |
| Materials | Live (empty) |
| About | Live (placeholders) |
| Authors + submit | Live (local form) |
| Editors & reviewers | Live |
| Editorial policies | Live |
| Issues | Live (planned Vol. 1) |
| Article page template | Live (no published articles) |

## Hosting

| Mode | URL | Chat / submit API |
|------|-----|-------------------|
| Local | `python server.py` → http://127.0.0.1:5173 | Full |
| GitHub Pages | `https://<user>.github.io/<repo>/` | Showcase only (chat hidden) |

## Re-run

```bash
python tools/revision_check.py
python tools/audit_site.py
```
