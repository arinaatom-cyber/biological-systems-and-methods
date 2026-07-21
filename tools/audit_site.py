# -*- coding: utf-8 -*-
"""Hard audit for Biological Sciences static site."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
findings: list[dict] = []


def add(sev: str, area: str, title: str, detail: str, fix: str = ""):
    findings.append({"sev": sev, "area": area, "title": title, "detail": detail, "fix": fix})


def read(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8")
    except Exception:
        return ""


# --- data honesty ---
articles = json.loads(read(ROOT / "data" / "articles.json") or "[]")
bodies = json.loads(read(ROOT / "data" / "article-bodies.json") or "{}")
editors = json.loads(read(ROOT / "data" / "editors.json") or "[]")
conf = json.loads(read(ROOT / "data" / "conferences.json") or "[]")
cfg = read(ROOT / "assets" / "js" / "config.js")

if articles:
    add("critical", "Data", "articles.json not empty", f"{len(articles)} articles present", "Clear fake articles")
else:
    add("ok", "Data", "articles.json empty", "0 articles", "")

if bodies:
    add("critical", "Data", "article-bodies.json not empty", f"{len(bodies)} bodies", "Clear fake bodies")
else:
    add("ok", "Data", "article-bodies empty", "OK", "")

if editors:
    add("critical", "Data", "editors.json not empty", f"{len(editors)} editors", "Clear until real board")
else:
    add("ok", "Data", "editors.json empty", "OK", "")

if "issn: null" not in cfg and "issn:null" not in cfg.replace(" ", ""):
    add("high", "Config", "ISSN may be set", "Check config.js", "")
else:
    add("ok", "Config", "issn is null", "OK", "")

if "conferenceEnabled: false" not in cfg:
    add("high", "Config", "conferenceEnabled not false", "Conferences may show", "Set conferenceEnabled: false")
else:
    add("ok", "Config", "conferenceEnabled false", "OK", "")

# --- banned patterns ---
banned = [
    (r"10\.xxxx|doi\.org/10\.(?!xxxx)", "DOI pattern"),
    (r"Petrova|Orlov|lorem ipsum", "Fake names / lorem"),
    (r"ISSN pending|issn pending", "ISSN pending"),
    (r"врач|Join as Editor / Doctor|clinical-doctor", "Doctor wording"),
    (r"демонстрац|тестов(ый|ая) сайт|trial desk|SuSy-style", "Demo wording"),
    (r"acceptance rate|~28%", "Fake metrics"),
    (r"example\.invalid", "Placeholder canonical domain"),
]
for pat, label in banned:
    rx = re.compile(pat, re.I)
    hits = []
    for p in ROOT.rglob("*"):
        if p.suffix.lower() not in {".html", ".js", ".json", ".md", ".ts", ".py", ".css"}:
            continue
        if any(x in p.parts for x in [".private", "node_modules", ".git", "canvases", "fixtures"]):
            continue
        if p.name in {"audit_site.py", "build_manuscript_template.py", "revision_check.py", "dummy-article.jats.xml"}:
            continue
        if "generateJATS" in p.name or "generate-jats" in p.name:
            continue
        text = read(p)
        if rx.search(text):
            hits.append(str(p.relative_to(ROOT)))
    if hits:
        sev = "critical" if label.startswith(("DOI", "Fake", "Doctor", "Demo", "Fake m")) else "high"
        if label.startswith("Placeholder"):
            sev = "medium"
        add(sev, "Copy", label, ", ".join(hits[:12]) + ("…" if len(hits) > 12 else ""), "Remove or localize")

# --- broken links ---
pages = {p.name for p in ROOT.glob("*.html")}
href_rx = re.compile(r"""href=["']([^"'#?]+)""")
missing = set()
for p in ROOT.glob("*.html"):
    for h in href_rx.findall(read(p)):
        if h.startswith(("http", "mailto:", "data:", "javascript:")):
            continue
        target = h.split("/")[-1] if "/" not in h.strip("./") else h
        # normalize
        path = (ROOT / h).resolve()
        try:
            path.relative_to(ROOT.resolve())
        except ValueError:
            continue
        if not path.exists() and not (ROOT / h).exists():
            missing.add(f"{p.name} -> {h}")

js = read(ROOT / "assets" / "js" / "site.js")
for m in re.finditer(r'href:\s*"([^"]+)"', js):
    h = m.group(1).split("?")[0]
    if not (ROOT / h).exists() and h not in pages:
        missing.add(f"site.js -> {h}")

if missing:
    add("high", "Links", f"{len(missing)} broken hrefs", "; ".join(sorted(missing)[:20]), "Fix or create targets")
else:
    add("ok", "Links", "No obvious broken local hrefs", "OK", "")

# --- i18n gaps: hardcoded EN in page modules ---
aims = read(ROOT / "assets" / "js" / "pages" / "aims.js")
if "Molecular and cell" in aims:
    add("high", "i18n", "aims.js still hardcodes English", "scope cards", "Use i18n keys")
else:
    add("ok", "i18n", "aims.js uses i18n", "OK", "")

types = read(ROOT / "assets" / "js" / "pages" / "article-types.js")
if "type.field.purpose" not in types:
    add("medium", "i18n", "article-types.js field labels not i18n", "Use type.field.* keys", "i18n field labels")
elif "Полноформатные" in types:
    add(
        "medium",
        "i18n",
        "article-types body copy still Russian-only",
        "Type descriptions do not switch with EN/ZH",
        "Add per-locale type descriptions when full i18n is required",
    )

# policy pages: EN lang but RU body
aims_html = read(ROOT / "aims.html")
if "Molecular and cell biology" in aims_html:
    add("medium", "i18n", "aims.html may embed EN", "static", "")

# --- forms / auth honesty ---
submit = read(ROOT / "assets" / "js" / "submit.js")
if re.search(r"successfully submitted|accepted for publication", submit, re.I):
    add("critical", "Forms", "Submit may claim acceptance", "submit.js", "Receipt ≠ acceptance")
else:
    add("ok", "Forms", "No acceptance claim found in submit.js", "OK", "")

apply_js = read(ROOT / "assets" / "js" / "apply.js")
server = read(ROOT / "server.py")
if "cv is required" in server and "getElementById(\"cv\")" not in apply_js:
    add("high", "Forms", "Server requires CV but join form has no CV field", "join.html / apply.js vs server.py", "Make CV optional on /api/apply")

# --- security ---
if "/.private" in read(ROOT / "server.py") or "BLOCKED_URL_PREFIXES" in server:
    add("ok", "Security", "Private inbox blocked from HTTP", "OK", "")
else:
    add("critical", "Security", "Private paths may be exposed", "server.py", "Block .private")

# --- topbar EN when RU ---
site = read(ROOT / "assets" / "js" / "site.js")
if "Open Access" in site and "data-i18n" not in site[site.find("Open Access") - 80 : site.find("Open Access") + 20]:
    add("medium", "i18n", "Topbar hardcodes Open Access / license in EN", "site.js renderHeader", "i18n topbar labels")

# --- metrics 0 ---
for key in ["articlesCount: 0", "issuesCount: 0", "authorsCount: 0", "editorsCount: 0"]:
    if key not in cfg:
        add("high", "Config", f"Missing or non-zero {key}", cfg[cfg.find(key.split(":")[0]) : cfg.find(key.split(":")[0]) + 40], "Force 0")

# template exists
tpl = ROOT / "templates" / "BSM-manuscript-template.docx"
tpl_legacy = ROOT / "templates" / "Biological-Sciences-manuscript-template.docx"
if tpl.exists() or tpl_legacy.exists():
    add("ok", "Authors", "Manuscript template present", (tpl if tpl.exists() else tpl_legacy).name, "")
else:
    add("medium", "Authors", "Manuscript template missing", "", "python tools/build_manuscript_template.py")

# conference in nav when disabled — site.js checks CFG.conferenceEnabled
if "CFG.conferenceEnabled" in site:
    add("ok", "Logic", "Nav gates conferences on config", "OK", "")
else:
    add("high", "Logic", "Conference nav not gated", "site.js", "Hide when false")

# summarize
counts = {}
for f in findings:
    counts[f["sev"]] = counts.get(f["sev"], 0) + 1

out = ROOT / "tools" / "audit-report.json"
out.write_text(json.dumps({"counts": counts, "findings": findings}, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(counts, indent=2))
for f in findings:
    if f["sev"] in {"critical", "high", "medium"}:
        print(f"[{f['sev'].upper()}] {f['area']}: {f['title']} — {f['detail'][:100]}")
