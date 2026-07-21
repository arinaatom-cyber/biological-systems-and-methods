# -*- coding: utf-8 -*-
"""Site revision checklist for Biological Systems and Methods."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAIL = []
WARN = []
OK = []


def check(cond: bool, ok: str, fail: str, warn: bool = False) -> None:
    if cond:
        OK.append(ok)
    elif warn:
        WARN.append(fail)
    else:
        FAIL.append(fail)


def main() -> int:
    cfg = (ROOT / "assets" / "js" / "config.js").read_text(encoding="utf-8")
    i18n = (ROOT / "assets" / "js" / "i18n.js").read_text(encoding="utf-8")
    site = (ROOT / "assets" / "js" / "site.js").read_text(encoding="utf-8")
    index = (ROOT / "index.html").read_text(encoding="utf-8")

    check(
        'journalName: "Biological Systems and Methods"' in cfg,
        "Brand EN casing OK",
        "Wrong EN journal name in config.js",
    )
    check(
        "Biological Systems And Methods" not in cfg
        and "Biological Systems And Methods" not in i18n
        and "Biological Systems And Methods" not in index,
        "No Title-Case 'And' brand",
        "Found 'Biological Systems And Methods'",
    )
    check(
        "Биологические системы и методы" in cfg,
        "Brand RU OK",
        "Missing RU brand in config",
    )
    check(
        "Биологические Системы И Методы" not in i18n,
        "No Title-Case RU brand in i18n",
        "Found Title-Case RU brand",
    )
    check('journalNameShort: "BSM"' in cfg, "Acronym BSM", "Missing BSM short name")
    check(
        "An International Journal of Biological Research and Methodology" in cfg,
        "Preferred subtitle present",
        "Subtitle missing preferred form",
        warn=True,
    )
    check("articlesCount: 0" in cfg, "articlesCount is 0", "articlesCount not 0")
    check("issuesCount: 0" in cfg, "issuesCount is 0", "issuesCount not 0")
    check("issn: null" in cfg, "ISSN null until real", "ISSN looks invented?", warn=True)
    check(
        "licenseAppliedToPublishedContent: false" in cfg,
        "Licence still planned (not applied)",
        "licenseAppliedToPublishedContent should be false until live OA articles",
    )
    check(
        '"chat.launcher": "Чат редакции"' in i18n
        and '"chat.launcher": "Editorial chat"' in i18n,
        "chat.launcher translated RU/EN",
        "chat.launcher missing translations",
    )
    check(
        '"nav.policies": "Редакционные политики"' in i18n,
        "Nav policies RU OK",
        "nav.policies not 'Редакционные политики'",
    )
    check(
        '"footer.corrections": "Исправления и ретракции"' in i18n,
        "Corrections = ретракции",
        "footer.corrections wording wrong",
    )
    check("submitHref" in site, "OJS submitHref helper", "submitHref missing in site.js")
    check(
        "submissionMode" in cfg and "ojsUrl" in cfg,
        "OJS config fields present",
        "OJS config fields missing",
    )
    check(
        "Открытие года" not in i18n and "issue.1.f1\": \"Interviews\"" not in i18n,
        "Issue 1 not pop-science opening",
        "Issue 1 still looks like interviews/opening feature",
    )
    check((ROOT / "docs" / "ROADMAP.md").is_file(), "ROADMAP.md present", "ROADMAP.md missing")
    check((ROOT / "docs" / "ojs-setup.md").is_file(), "ojs-setup.md present", "ojs-setup.md missing")
    check((ROOT / "editorial_agent.py").is_file(), "Editorial agent present", "editorial_agent.py missing")

    print("=== BSM revision check ===")
    for line in OK:
        print(f"  OK   {line}")
    for line in WARN:
        print(f"  WARN {line}")
    for line in FAIL:
        print(f"  FAIL {line}")
    print(f"\n{len(OK)} ok · {len(WARN)} warn · {len(FAIL)} fail")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
