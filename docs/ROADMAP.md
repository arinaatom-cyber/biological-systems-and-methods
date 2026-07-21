# Biological Systems and Methods — roadmap

Official names: **Biological Systems and Methods** · **Биологические системы и методы** · **BSM**

This file tracks the journal plan. Checkboxes move from `[ ]` to `[x]` only when evidence exists — never invent ISSN, board members, DOI, or articles.

## Site information architecture

| Section | Status |
|--------|--------|
| Home (brand, metrics, articles, issues, aims) | Done (empty until real data) |
| Materials (all / types) | Done (empty list) |
| About (aims, board, publisher, contacts, news) | Done (placeholders) |
| Authors (guidelines, types, files, APC, data, submit) | Done |
| Editors & reviewers | Done |
| Editorial policies | Done |
| Issues (volume / number / year) | Done (planned Vol. 1 · 2026) |
| Article page (title, authors/ORCID, abstract, DOI, PDF/HTML, history, funding, data/code, licence, refs) | Template ready |

---

## Stage 1 — Public site & design

- [x] Brand: Biological Systems and Methods / Биологические системы и методы / BSM
- [x] Subtitle: An International Journal of Biological Research and Methodology
- [x] Single config: `src/config/journal.ts` + `assets/js/config.js`
- [x] Stats remain `0` / `—` until real data
- [x] `chat.launcher` translated; editorial agent enabled
- [x] RU shell + home copy revised
- [x] Sticky header + mobile nav improvements
- [ ] Full EN/ZH for long policy HTML bodies (shell/nav/home done; page bodies still RU-first)
- [ ] Visual QA on real phones (Chrome / Safari)

**Owner note:** finish EN/ZH policy bodies after OJS branding freeze, or generate from a single content source.

---

## Stage 2 — Publishing system (OJS)

- [x] Config hooks: `submissionMode`, `ojsUrl`, `ojsEnabled` in journal config
- [x] Submit CTA can redirect to OJS when URL is set (see `docs/ojs-setup.md`)
- [ ] Install / host OJS
- [ ] Create journal in OJS (BSM), sections, workflows
- [ ] Author / editor / reviewer roles
- [ ] Set `ojsUrl` + `submissionMode: "ojs"`
- [ ] Retire or demote local `submit.html` form to backup only

---

## Stage 3 — Legal foundation

- [ ] Register ANO **or** university publisher agreement
- [ ] Journal statute / regulation
- [ ] Appoint Editor-in-Chief (real person → `editorInChief` in config)
- [ ] Form editorial board (real names → `editorial.html` + `editorsCount`)
- [ ] Author agreement + policy pack signed off

---

## Stage 4 — Bibliographic infrastructure

Order (do not skip ahead without prerequisites):

1. [ ] ISSN / eISSN → write into config (`issn`, `eissn`)
2. [ ] Crossref membership
3. [ ] DOI prefix + deposit pipeline (`doiInfrastructureActive: true`)
4. [ ] ORCID in submission & article display
5. [ ] Google Scholar indexing (live articles + citation meta)
6. [ ] eLIBRARY / RSCI
7. [ ] DOAJ
8. [ ] VAK (if applicable)
9. [ ] Scopus
10. [ ] Web of Science
11. [ ] PubMed Central (if biomedical scope justifies)

---

## Stage 5 — First issue (Vol. 1)

Minimum target after real peer review:

- [ ] 6–10 original research
- [ ] 2 methods papers
- [ ] 1–2 reviews
- [ ] 1–2 negative / replication studies
- [ ] Set `issuesCount` / `articlesCount` only after publication
- [ ] Set `licenseAppliedToPublishedContent: true` when OA licence applies to live content

---

## Stage 6 — Promotion

- [ ] Invitations via research organisations
- [ ] Thematic special issues
- [ ] Telegram / VK / LinkedIn / scholarly mailing lists
- [ ] Visual abstracts
- [ ] University / conference partnerships
- [ ] Temporary APC waiver for first strong papers (`waiverPolicyPublished: true` when published)

---

## Realistic timeline

| Workstream | Horizon |
|------------|---------|
| Site + OJS | 1–2 months |
| Legal + editorial board | 2–4 months |
| First issue | 4–8 months |
| RSCI / DOAJ | after sustained output |
| Scopus / WoS | ~2–4 years |

---

## How to run the public site

```bash
cd C:\Users\Arina1996\Projects\bioscientia
python server.py
```

Open http://127.0.0.1:5173

Revision checklist: `python tools/revision_check.py`
