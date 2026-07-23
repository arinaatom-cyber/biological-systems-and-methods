# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://arinaatom-cyber.github.io/biological-systems-and-methods"
FINDINGS: list[dict] = []


def add(sev: str, area: str, title: str, detail: str = "") -> None:
    FINDINGS.append({"sev": sev, "area": area, "title": title, "detail": detail})


def fetch(path: str) -> tuple[int, str]:
    try:
        req = urllib.request.Request(
            BASE + path,
            headers={"User-Agent": "BSM-audit/1.0"},
        )
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        return 0, str(exc)


def main() -> None:
    code, home = fetch("/")
    add("ok" if code == 200 else "critical", "Live", "Home HTTP", str(code))
    if code == 200:
        add(
            "ok" if "Biological Systems and Methods" in home else "critical",
            "Live",
            "Brand on home",
            "",
        )
        add(
            "ok" if "Biological Systems And Methods" not in home else "high",
            "Live",
            "No Title-Case And",
            "",
        )
        add(
            "ok" if "chat.launcher" not in home else "critical",
            "Live",
            "No raw chat.launcher key",
            "",
        )

    for path in [
        "/assets/js/config.js",
        "/assets/js/site.js",
        "/assets/js/i18n.js",
        "/assets/js/chatbot.js",
        "/data/articles.json",
        "/policies.html",
        "/submit.html",
        "/issues.html",
    ]:
        c, _ = fetch(path)
        add("ok" if c == 200 else "critical", "Live", f"{path}", str(c))

    _, cfg = fetch("/assets/js/config.js")
    _, site = fetch("/assets/js/site.js")
    _, i18n = fetch("/assets/js/i18n.js")
    _, articles = fetch("/data/articles.json")

    if cfg:
        add("ok" if "articlesCount: 0" in cfg else "critical", "Honesty", "articlesCount 0", "")
        add("ok" if "issn: null" in cfg else "high", "Honesty", "issn null", "")
        add(
            "ok" if "licenseAppliedToPublishedContent: false" in cfg else "high",
            "Honesty",
            "Licence planned",
            "",
        )
        add("ok" if 'journalName: "Biological Systems and Methods"' in cfg else "critical", "Brand", "EN name", "")
        add("ok" if "chatEnabled: true" in cfg else "medium", "Agent", "chatEnabled", "")
        add("ok" if 'submissionMode: "local"' in cfg else "medium", "OJS", "submissionMode", "")

    if site:
        # Source contains \.github\.io — check escaped form
        gated = r"\.github\.io" in site or "github.io" in site.replace("\\", "")
        add(
            "ok" if gated and "BSChat" in site else "high",
            "Agent",
            "Chat gated on static host",
            "",
        )

    if i18n:
        add(
            "ok" if '"chat.launcher": "Чат редакции"' in i18n else "critical",
            "Agent",
            "chat.launcher RU",
            "",
        )
        add(
            "ok" if "Редакционные политики" in i18n else "high",
            "Copy",
            "Policies label",
            "",
        )
        add(
            "ok" if "Исправления и ретракции" in i18n else "high",
            "Copy",
            "Retractions label",
            "",
        )

    try:
        data = json.loads(articles) if articles.strip().startswith("[") else None
        add("ok" if data == [] else "critical", "Honesty", "articles.json empty", repr(data)[:40])
    except json.JSONDecodeError:
        add("critical", "Honesty", "articles.json invalid", articles[:60])

    api_c, _ = fetch("/api/chat/welcome")
    add(
        "ok" if api_c in (0, 404) else "medium",
        "Agent",
        "No API on Pages (expected)",
        f"status={api_c}",
    )

    counts: dict[str, int] = {}
    for f in FINDINGS:
        counts[f["sev"]] = counts.get(f["sev"], 0) + 1
    out = ROOT / "docs" / "AUDIT-live.json"
    out.write_text(
        json.dumps({"base": BASE, "counts": counts, "findings": FINDINGS}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(counts, ensure_ascii=False, indent=2))
    for f in FINDINGS:
        mark = "OK  " if f["sev"] == "ok" else f["sev"].upper()[:4]
        print(f"{mark} [{f['area']}] {f['title']}" + (f" — {f['detail']}" if f["detail"] else ""))


if __name__ == "__main__":
    main()
