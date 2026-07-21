# OJS setup for Biological Systems and Methods (BSM)

Public site = showcase. **OJS** = submission, peer review, editorial workflow.

## 1. Install

- Host OJS 3.4+ (or current LTS) on HTTPS.
- Create journal: **Biological Systems and Methods** / RU title **Биологические системы и методы** / acronym **BSM**.
- Match APC, licence (planned CC BY 4.0), and section list with the public site.

## 2. Wire the showcase site

In `assets/js/config.js` and `src/config/journal.ts`:

```js
submissionMode: "ojs",
ojsEnabled: true,
ojsUrl: "https://YOUR-OJS-HOST/index.php/bsm/submission/wizard",
```

Effects:

- Header / footer / nav «Подать рукопись» open OJS.
- `submit.html` shows the OJS banner; local wizard hides when `submissionMode === "ojs"`.

Keep `submissionMode: "local"` until the OJS journal is tested end-to-end.

## 3. Roles

Configure in OJS:

- Authors
- Section / scientific editors
- Reviewers
- Journal manager

Point users from `join.html` / `apply.html` to OJS registration when ready.

## 4. Content sync

After acceptance & production:

1. Export or copy metadata into `data/articles.json` (+ body if HTML).
2. Increment real counters in config only with published facts.
3. Set `licenseAppliedToPublishedContent: true` when articles are live under CC BY 4.0.
4. Never invent DOI/ISSN before Crossref/ISSN assignment.

## 5. Checklist before go-live

- [ ] Test author submission in OJS
- [ ] Test reviewer invite / recommendation
- [ ] Test editor decision letters
- [ ] Email delivery (SMTP) works
- [ ] Showcase CTAs point to OJS
- [ ] Privacy / cookie notices cover OJS domain if separate
