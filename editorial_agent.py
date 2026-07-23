# -*- coding: utf-8 -*-
"""Editorial support agent for Biological Systems and Methods (BSM).

Answers standard author questions from journal facts, runs a technical
pre-screen of manuscript text (character/word counts, section heuristics),
and escalates to a human operator when needed.

Optional LLM (OpenAI-compatible) via BS_OPENAI_API_KEY — never used for
accept/reject decisions.
"""

from __future__ import annotations

import io
import json
import os
import re
import smtplib
import uuid
import zipfile
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Any
from urllib import error as urlerror
from urllib import request as urlrequest
from xml.etree import ElementTree as ET

JOURNAL = {
    "name": "Biological Systems and Methods",
    "name_ru": "Биологические системы и методы",
    "short": "BSM",
    "apc_rub": 75_000,
    "apc_cny": 6_000,
    "first_decision_days": 21,
    "issues_per_year": 4,
    "license": "CC BY 4.0",
    "license_applied": False,
    "issn": None,
    "submit_url": "submit.html",
    "guide_url": "authors-guidelines.html",
    "types_url": "article-types.html",
    "negative_url": "negative-results.html",
    "apc_url": "apc.html",
    "contact_email": os.environ.get("BS_EDITORIAL_EMAIL", "arina.atom@gmail.com"),
}

REQUIRED_HINTS = [
    ("title", r"\b(title|название)\b", "название"),
    ("abstract", r"\b(abstract|аннотация|резюме)\b", "аннотация"),
    ("keywords", r"\b(keywords?|ключевые слова)\b", "ключевые слова"),
    ("introduction", r"\b(introduction|введение)\b", "введение"),
    ("methods", r"\b(materials?\s+and\s+methods|методы|материалы и методы)\b", "материалы и методы"),
    ("results", r"\b(results?|результаты)\b", "результаты"),
    ("discussion", r"\b(discussion|обсуждение)\b", "обсуждение"),
    ("references", r"\b(references|литература|bibliography)\b", "список литературы"),
    ("data", r"\b(data availability|доступность данных)\b", "доступность данных"),
    ("funding", r"\b(funding|финансирование|acknowledgements?|благодарности)\b", "финансирование / благодарности"),
    ("coi", r"\b(conflict of interest|конфликт.*интерес)\b", "конфликт интересов"),
]

FAQ: list[dict[str, Any]] = [
    {
        "id": "apc",
        "patterns": [
            r"\bapc\b",
            r"стоимост",
            r"оплат",
            r"плат[её]",
            r"fee",
            r"charge",
            r"публикац.*сбор",
            r"сколько.*(стоит|стоит|стоит)",
            r"price",
            r"cost",
        ],
        "answer_ru": (
            "Сбор за обработку статьи (Article Processing Charge, APC): "
            f"{JOURNAL['apc_rub']:_} RUB / {JOURNAL['apc_cny']:_} CNY.\n\n"
            "Подача рукописи и рецензирование бесплатны. APC взимается только после "
            "принятия статьи к публикации и не влияет на редакционное решение. "
            "Способность автора оплатить APC не учитывается при научной оценке.\n\n"
            f"Подробнее: {JOURNAL['apc_url']}"
        ).replace("_", " "),
    },
    {
        "id": "submit",
        "patterns": [r"подат", r"отправ", r"как.*рукопис", r"submit", r"upload", r"загруз"],
        "answer_ru": (
            "Как подать рукопись:\n"
            f"1. Откройте «Подать рукопись» → {JOURNAL['submit_url']}\n"
            "2. Заполните метаданные, авторов, файлы и декларации\n"
            "3. Загрузите PDF/DOCX (или LaTeX ZIP) и сопроводительное письмо\n\n"
            "После отправки вы получите подтверждение получения — это не решение о принятии.\n"
            f"Инструкции: {JOURNAL['guide_url']}"
        ),
    },
    {
        "id": "review",
        "patterns": [r"реценз", r"peer.?review", r"сроки?", r"first decision", r"21\s*дн"],
        "answer_ru": (
            f"Целевой срок до первого решения — {JOURNAL['first_decision_days']} дней. "
            "Срок зависит от тематики, доступности рецензентов и необходимости дополнительной проверки. "
            "Рецензирование — double-blind. Редакционные решения принимают научные редакторы; "
            "автоматизированные инструменты не принимают решений по рукописям."
        ),
    },
    {
        "id": "oa",
        "patterns": [r"открыт.*доступ", r"open access", r"\bcc\s*by\b", r"лиценз"],
        "answer_ru": (
            "Планируемая модель: открытый доступ, лицензия "
            f"{JOURNAL['license']}. "
            "Пока статьи не опубликованы, лицензия указывается как планируемая. "
            "ISSN пока не присвоен (ISSN: —)."
        ),
    },
    {
        "id": "scope",
        "patterns": [r"тематик", r"scope", r"aims", r"что публик", r"подходит ли"],
        "answer_ru": (
            f"{JOURNAL['name']} публикует экспериментальные, вычислительные и методологические "
            "исследования биологических систем: биология, биоинформатика и омиксные технологии, "
            "биохимия, биофизика, методы и воспроизводимость. "
            "Рассматриваются положительные, отрицательные, нулевые и репликационные исследования "
            "при корректном дизайне и статистике.\n\n"
            "Страница: aims.html"
        ),
    },
    {
        "id": "negative",
        "patterns": [r"отрицательн", r"нулев", r"negative", r"null result", r"registered report"],
        "answer_ru": (
            "Отрицательные, нулевые и неожиданные результаты рассматриваются по тому же "
            "научному стандарту: гипотеза, размер выборки, размер эффекта и ДИ, отклонения "
            "от протокола, данные и код, ограничения. Отсутствие статистической значимости "
            "само по себе не основание для публикации.\n\n"
            f"Требования: {JOURNAL['negative_url']}"
        ),
    },
    {
        "id": "types",
        "patterns": [r"тип.*рукопис", r"article type", r"какие статьи"],
        "answer_ru": (
            "Типы рукописей включают оригинальные исследования, методы, протоколы, "
            "краткие сообщения, обзоры, программное обеспечение, базы данных, "
            "отрицательные/нулевые результаты, репликации и Registered Reports.\n\n"
            f"Список: {JOURNAL['types_url']}"
        ),
    },
    {
        "id": "issues",
        "patterns": [r"выпуск", r"том\s*1", r"issue", r"volume"],
        "answer_ru": (
            f"Том 1 · 2026 — {JOURNAL['issues_per_year']} выпуска:\n"
            "• № 1 — Биологические системы и экспериментальные методы\n"
            "• № 2 — Вычислительная биология и омиксные технологии\n"
            "• № 3 — Отрицательные, нулевые и неожиданные результаты\n"
            "• № 4 — Обзоры, достижения и перспективы\n\n"
            "Страница: issues.html"
        ),
    },
    {
        "id": "ai_policy",
        "patterns": [r"\bии\b", r"\bai\b", r"chatgpt", r"генератив"],
        "answer_ru": (
            "Генеративный ИИ нельзя указывать как автора. Использование ИИ для текста, "
            "рисунков или кода должно быть раскрыто. Редакционные решения принимает "
            "редакция; этот чат не принимает рукописи и не выносит вердикт о публикации.\n"
            "Политика: ai-policy.html"
        ),
    },
    {
        "id": "contact",
        "patterns": [r"контакт", r"email", r"почт", r"связ"],
        "answer_ru": (
            f"Редакция: {JOURNAL['contact_email']}\n"
            "Страница контактов: contact.html\n"
            "Если вопрос нестандартный — нажмите «Вызвать оператора» в чате."
        ),
    },
]


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def match_faq(message: str) -> dict[str, Any] | None:
    low = _norm(message)
    for item in FAQ:
        for pat in item["patterns"]:
            if re.search(pat, low, re.I):
                return item
    return None


def wants_operator(message: str) -> bool:
    low = _norm(message)
    keys = [
        r"оператор",
        r"человек",
        r"менеджер",
        r"редактор.*(связ|позв|напиш)",
        r"human",
        r"operator",
        r"call.*(editor|support)",
        r"живой",
        r"не помог",
        r"эскалац",
    ]
    return any(re.search(k, low, re.I) for k in keys)


def _looks_like_manuscript(text: str) -> bool:
    low = text.lower()
    hits = sum(
        1
        for pat in (
            r"\babstract\b",
            r"\bintroduction\b",
            r"\bmethods?\b",
            r"\bresults?\b",
            r"\breferences\b",
            r"аннотация",
            r"введение",
            r"методы",
            r"результаты",
            r"литература",
        )
        if re.search(pat, low)
    )
    return hits >= 2 and text.count("\n") >= 8


def wants_check(message: str) -> bool:
    low = _norm(message)
    keys = [
        r"провер",
        r"прескрин",
        r"pre-?check",
        r"pre-?screen",
        r"символ",
        r"character",
        r"word count",
        r"объ[её]м",
        r"посмотр.*стать",
        r"рукопис",
        r"manuscript",
    ]
    return any(re.search(k, low, re.I) for k in keys)


def extract_text_from_bytes(filename: str, data: bytes) -> tuple[str, list[str]]:
    """Return (text, warnings)."""
    warnings: list[str] = []
    ext = Path(filename or "").suffix.lower()
    if not data:
        return "", ["Файл пуст."]

    if ext in {".txt", ".tex", ".md", ".csv", ".rtf"}:
        return data.decode("utf-8", errors="replace"), warnings

    if ext == ".docx":
        try:
            return _extract_docx(data), warnings
        except Exception as exc:  # noqa: BLE001
            return "", [f"Не удалось прочитать DOCX: {exc}"]

    if ext == ".doc":
        warnings.append(
            "Формат .doc (старый Word) не разбирается автоматически. "
            "Сохраните как .docx/.txt или вставьте текст в чат."
        )
        return "", warnings

    if ext == ".pdf":
        text, warn = _extract_pdf(data)
        warnings.extend(warn)
        return text, warnings

    if ext == ".zip":
        return _extract_zip(data)

    warnings.append(
        f"Формат {ext or 'unknown'} для автопроверки не поддерживается. "
        "Загрузите .txt, .docx, .tex, .pdf или вставьте текст."
    )
    return "", warnings


def _extract_docx(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    parts: list[str] = []
    for node in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"):
        if node.text:
            parts.append(node.text)
        if node.tail:
            parts.append(node.tail)
    # Prefer paragraph breaks
    paras = []
    for p in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        texts = [t.text or "" for t in p.findall(".//w:t", ns)]
        line = "".join(texts).strip()
        if line:
            paras.append(line)
    return "\n".join(paras) if paras else " ".join(parts)


def _extract_pdf(data: bytes) -> tuple[str, list[str]]:
    warnings: list[str] = []
    for mod_name in ("pypdf", "PyPDF2"):
        try:
            mod = __import__(mod_name)
            reader = mod.PdfReader(io.BytesIO(data))
            chunks = []
            for page in reader.pages[:80]:
                chunks.append(page.extract_text() or "")
            text = "\n".join(chunks).strip()
            if not text:
                warnings.append(
                    "PDF открыт, но текст не извлечён (возможно, сканы). "
                    "Загрузите DOCX/TXT или вставьте текст."
                )
            return text, warnings
        except ImportError:
            continue
        except Exception as exc:  # noqa: BLE001
            return "", [f"Ошибка чтения PDF: {exc}"]
    return "", [
        "Для PDF установите пакет pypdf (`pip install pypdf`) или загрузите DOCX/TXT / вставьте текст."
    ]


def _extract_zip(data: bytes) -> tuple[str, list[str]]:
    warnings: list[str] = []
    texts: list[str] = []
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            names = [n for n in zf.namelist() if not n.endswith("/")]
            warnings.append(f"В архиве файлов: {len(names)}.")
            prefer = [n for n in names if Path(n).suffix.lower() in {".tex", ".txt", ".md"}]
            for name in (prefer or names)[:12]:
                ext = Path(name).suffix.lower()
                if ext not in {".tex", ".txt", ".md", ".docx"}:
                    continue
                raw = zf.read(name)
                if ext == ".docx":
                    texts.append(_extract_docx(raw))
                else:
                    texts.append(raw.decode("utf-8", errors="replace"))
    except Exception as exc:  # noqa: BLE001
        return "", [f"Не удалось открыть ZIP: {exc}"]
    if not texts:
        warnings.append("В ZIP не найдены .tex/.txt/.md/.docx для текстовой проверки.")
    return "\n\n".join(texts), warnings


def _build_fix_items(
    *,
    found: list[str],
    missing: list[str],
    chars: int,
    words: int,
    lang: str,
    clean: str,
    warnings: list[str],
) -> list[dict[str, str]]:
    """Structured author-facing comments with severity and example fixes."""
    items: list[dict[str, str]] = []

    def add(sev: str, title: str, detail: str, example: str) -> None:
        items.append({"severity": sev, "title": title, "detail": detail, "example": example})

    core = ["аннотация", "введение", "материалы и методы", "результаты", "обсуждение", "список литературы"]
    for label in missing:
        if label == "аннотация":
            add(
                "high",
                "Добавьте аннотацию (Abstract)",
                "Аннотация не распознана. Нужен отдельный блок 150–250 слов: цель, методы, главный результат, вывод.",
                "Abstract\nWe tested whether X affects Y in Z cells (n = 12). "
                "Mean difference was 0.4 (95% CI 0.1–0.7). We conclude that…",
            )
        elif label == "материалы и методы":
            add(
                "high",
                "Расширьте «Материалы и методы»",
                "Раздел методов не найден или слабо обозначен. Укажите дизайн, выборку, репликаты, статистику и ПО с версиями.",
                "Materials and Methods\nSample size was justified a priori (α = 0.05, power 0.8). "
                "Analyses used R 4.3; code is deposited at…",
            )
        elif label == "доступность данных":
            add(
                "high",
                "Укажите доступность данных",
                "Для BSM обязателен блок Data availability (репозиторий, DOI/URL или обоснованное «None»).",
                "Data availability\nRaw counts are at https://zenodo.org/… (DOI will be added upon acceptance). "
                "Or: None — data contain identifiable human information; summary tables are in Supplement.",
            )
        elif label == "конфликт интересов":
            add(
                "medium",
                "Добавьте декларацию конфликтов интересов",
                "Нужна явная фраза о наличии/отсутствии COI.",
                "Conflicts of interest\nThe authors declare no competing interests.",
            )
        elif label == "финансирование / благодарности":
            add(
                "medium",
                "Укажите финансирование",
                "Нужен грант/номер или явное «None».",
                "Funding\nThis work was supported by Grant No. … / None.",
            )
        elif label in core:
            add(
                "high",
                f"Добавьте раздел «{label}»",
                f"Заголовок «{label}» не распознан. Оформите как отдельный раздел рукописи.",
                f"{label.capitalize()}\n[Краткое содержание раздела…]",
            )
        else:
            add(
                "low",
                f"Проверьте раздел «{label}»",
                "Маркер раздела не найден автоматически — добавьте явный заголовок.",
                f"{label}\n…",
            )

    if chars < 1500 or words < 250:
        add(
            "high",
            "Текст слишком короткий",
            "Объём похож на фрагмент, а не на полную рукопись. Загрузите полный файл или вставьте полный текст.",
            "Ожидаемый порядок: Title → Abstract → Introduction → Methods → Results → Discussion → References.",
        )
    elif words < 1500 and "обзоры" not in " ".join(found).lower():
        add(
            "medium",
            "Проверьте полноту статьи",
            "Слов относительно мало для original research. Если это short communication — укажите тип рукописи явно.",
            "Article type: Short Communication\nWord count (main text): …",
        )

    if lang.startswith("русский") and not re.search(r"\babstract\b", clean, re.I):
        add(
            "medium",
            "Рекомендуется английская аннотация",
            "Запись журнала ориентирована на английский abstract даже при русском интерфейсе сайта.",
            "Abstract (English)\n…",
        )

    if not re.search(r"\b(n\s*=|sample size|размер выборк|участник|пациент|biological replicate)", clean, re.I):
        add(
            "medium",
            "Уточните размер выборки / репликаты",
            "Не видно явного n / sample size / biological vs technical replicates.",
            "We analysed n = 18 biological replicates (3 technical replicates each).",
        )

    if not re.search(r"\b(p\s*[<=>]|95%\s*ci|confidence interval|доверительн|effect size|размер эффект)", clean, re.I):
        add(
            "medium",
            "Усильте статистическую отчётность",
            "Желательно указать p-value и/или размер эффекта с доверительными интервалами.",
            "Mean difference = 1.2 (95% CI 0.4–2.0), p = 0.01, Cohen’s d = 0.6.",
        )

    if re.search(r"\b(chatgpt|gpt-4|generative ai|нейросет)\b", clean, re.I) and not re.search(
        r"\b(disclos|раскрыт|использован.*ии|ai use)\b", clean, re.I
    ):
        add(
            "medium",
            "Раскройте использование генеративного ИИ",
            "Упоминание ИИ есть, но нет явного disclosure по политике журнала.",
            "AI use\nChatGPT was used for language editing only; authors verified all scientific content.",
        )

    for w in warnings:
        add("medium", "Техническое замечание", w, "Исправьте файл и повторите проверку.")

    # Deduplicate by title
    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for it in items:
        if it["title"] in seen:
            continue
        seen.add(it["title"])
        unique.append(it)
    return unique[:12]


def analyze_manuscript(text: str, *, filename: str | None = None, warnings: list[str] | None = None) -> dict[str, Any]:
    warnings = list(warnings or [])
    clean = text.replace("\r\n", "\n").replace("\r", "\n")
    chars = len(clean)
    chars_ns = len(re.sub(r"\s+", "", clean))
    words = len(re.findall(r"[A-Za-zА-Яа-яЁё0-9\-']+", clean))
    lines = len([ln for ln in clean.split("\n") if ln.strip()])
    cyr = len(re.findall(r"[А-Яа-яЁё]", clean))
    lat = len(re.findall(r"[A-Za-z]", clean))
    if cyr + lat == 0:
        lang = "не определён"
    elif cyr >= lat:
        lang = "русский (эвристика)"
    else:
        lang = "английский (эвристика)"

    found: list[str] = []
    missing: list[str] = []
    low = clean.lower()
    for _key, pat, label in REQUIRED_HINTS:
        if re.search(pat, low, re.I):
            found.append(label)
        else:
            missing.append(label)

    if chars < 1500:
        warnings.append("Текст очень короткий для полноценной статьи — возможно, загружен фрагмент.")
    elif chars > 250_000:
        warnings.append("Текст очень длинный; убедитесь, что загружен именно файл рукописи.")

    fixes = _build_fix_items(
        found=found,
        missing=missing,
        chars=chars,
        words=words,
        lang=lang,
        clean=clean,
        warnings=warnings,
    )
    high = sum(1 for f in fixes if f["severity"] == "high")
    medium = sum(1 for f in fixes if f["severity"] == "medium")
    # Readiness: sections found / required hints, penalize high issues
    section_score = int(100 * len(found) / max(len(REQUIRED_HINTS), 1))
    penalty = min(60, high * 12 + medium * 5)
    readiness = max(5, min(98, section_score - penalty))
    if not clean.strip():
        readiness = 0

    if readiness >= 75 and high == 0:
        verdict = "Технически близко к подаче — устраните оставшиеся замечания и подайте рукопись."
    elif readiness >= 45:
        verdict = "Требуется доработка перед подачей (см. список «Что исправить»)."
    else:
        verdict = "Рукопись пока не готова к подаче: не хватает ключевых разделов или объёма."

    report: list[str] = [
        "Предпроверка рукописи BSM (техническая; не рецензирование и не решение редакции)",
        "═" * 40,
        f"Файл: {filename or 'вставленный текст'}",
        f"Объём: {chars:_} симв. · {words:_} слов · {lines} строк".replace("_", " "),
        f"Язык (эвристика): {lang}",
        f"Готовность к подаче (техскрининг): {readiness}%",
        f"Вердикт: {verdict}",
        "",
        "Чек-лист разделов:",
    ]
    for _key, _pat, label in REQUIRED_HINTS:
        mark = "✓" if label in found else "✗"
        report.append(f"  {mark} {label}")

    report += ["", "Что исправить (приоритет):"]
    if not fixes:
        report.append("  • Критичных технических пробелов не видно. Проверьте смысл, статистику и рисунки вручную.")
    else:
        for i, item in enumerate(fixes, 1):
            badge = {"high": "ВЫСОКИЙ", "medium": "СРЕДНИЙ", "low": "НИЗКИЙ"}.get(item["severity"], item["severity"])
            report += [
                f"{i}. [{badge}] {item['title']}",
                f"   {item['detail']}",
                "   Пример, как улучшить:",
                "   ┌─",
                *[f"   │ {ln}" for ln in item["example"].splitlines()],
                "   └─",
                "",
            ]

    report += [
        "Пример итогового ответа автору:",
        "┌─",
        f"│ Уважаемый автор, по файлу «{filename or 'manuscript'}» выполнен технический прескрин BSM.",
        f"│ Оценка готовности: {readiness}%. {verdict}",
        "│ Главное к исправлению:",
    ]
    top = fixes[:3] if fixes else []
    if top:
        for item in top:
            report.append(f"│ — {item['title']}")
    else:
        report.append("│ — Существенных технических пробелов не выявлено.")
    report += [
        "│ После правок повторите проверку в чате и подайте рукопись через форму журнала.",
        "│ Это не решение о принятии.",
        "└─",
        "",
        "Отправить эти замечания редакции: нажмите «Отправить отчёт редакции» в чате "
        "или напишите «отправь отчёт».",
        f"Подача: {JOURNAL['submit_url']} · Инструкции: {JOURNAL['guide_url']}",
    ]

    editorial_blob = "\n".join(
        [
            f"[BSM pre-check] {filename or 'manuscript'}",
            f"Readiness: {readiness}%",
            f"Chars/words: {chars}/{words}",
            f"Language: {lang}",
            f"Missing sections: {', '.join(missing) if missing else '—'}",
            "",
            "Fixes:",
            *[f"- [{f['severity']}] {f['title']}: {f['detail']}" for f in fixes],
        ]
    )

    return {
        "ok": True,
        "chars": chars,
        "charsNoSpaces": chars_ns,
        "words": words,
        "lines": lines,
        "languageGuess": lang,
        "sectionsFound": found,
        "sectionsMissing": missing,
        "warnings": warnings,
        "filename": filename,
        "readiness": readiness,
        "verdict": verdict,
        "fixes": fixes,
        "editorialReport": editorial_blob,
        "reply": "\n".join(report),
    }


def create_operator_ticket(
    *,
    data_root: Path,
    message: str,
    session_id: str,
    contact: str | None = None,
    history: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    tickets = data_root / "operator-tickets"
    tickets.mkdir(parents=True, exist_ok=True)
    tid = f"OP-{utc_now()}-{uuid.uuid4().hex[:6].upper()}"
    folder = tickets / tid
    folder.mkdir(parents=True, exist_ok=True)
    payload = {
        "id": tid,
        "createdAt": utc_now(),
        "sessionId": session_id,
        "contact": contact or "",
        "message": message,
        "history": history or [],
        "status": "open",
    }
    (folder / "ticket.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    emailed = False
    smtp_host = os.environ.get("BS_SMTP_HOST", "")
    smtp_user = os.environ.get("BS_SMTP_USER", "")
    smtp_pass = os.environ.get("BS_SMTP_PASS", "")
    smtp_port = int(os.environ.get("BS_SMTP_PORT", "587"))
    smtp_from = os.environ.get("BS_SMTP_FROM", smtp_user or "noreply@bsm.local")
    editorial = JOURNAL["contact_email"]

    body = (
        f"BSM operator ticket {tid}\n"
        f"Session: {session_id}\n"
        f"Contact: {contact or '—'}\n\n"
        f"Message:\n{message}\n\n"
        f"History:\n{json.dumps(history or [], ensure_ascii=False, indent=2)}"
    )
    (folder / "message.txt").write_text(body, encoding="utf-8")

    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = EmailMessage()
            msg["Subject"] = f"[BSM] Operator ticket {tid}"
            msg["From"] = smtp_from
            msg["To"] = editorial
            msg.set_content(body)
            with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as smtp:
                smtp.starttls()
                smtp.login(smtp_user, smtp_pass)
                smtp.send_message(msg)
            emailed = True
        except Exception:  # noqa: BLE001
            emailed = False

    reply = (
        f"Обращение передано оператору редакции.\n\n"
        f"Номер обращения: {tid}\n"
        f"Контакт редакции: {editorial}\n\n"
        + (
            "Уведомление отправлено на почту редакции."
            if emailed
            else "Заявка сохранена в очереди редакции (SMTP не настроен — оператор увидит тикет на сервере)."
        )
        + "\nОбычно отвечаем в рабочие часы. По срочным вопросам напишите на указанный email."
    )
    return {"ok": True, "ticketId": tid, "emailed": emailed, "reply": reply}


def _optional_llm_reply(message: str, history: list[dict[str, str]]) -> str | None:
    api_key = os.environ.get("BS_OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    base = (os.environ.get("BS_OPENAI_BASE") or "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("BS_OPENAI_MODEL") or "gpt-4o-mini"
    system = (
        f"You are the editorial support assistant for {JOURNAL['name']} ({JOURNAL['short']}). "
        "Answer briefly in the user's language (prefer Russian). "
        "Use only known journal facts: "
        f"APC {JOURNAL['apc_rub']} RUB / {JOURNAL['apc_cny']} CNY after acceptance only; "
        f"target first decision {JOURNAL['first_decision_days']} days; "
        f"planned OA {JOURNAL['license']}; ISSN not yet assigned; "
        "never invent acceptance, DOI, ISSN, editors, or published articles. "
        "You do not make editorial decisions. If unsure or request needs a human, say to call the operator."
    )
    messages = [{"role": "system", "content": system}]
    for turn in (history or [])[-8:]:
        role = "assistant" if turn.get("role") == "bot" else "user"
        content = (turn.get("text") or "").strip()
        if content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})
    payload = json.dumps(
        {"model": model, "messages": messages, "temperature": 0.2, "max_tokens": 700}
    ).encode("utf-8")
    req = urlrequest.Request(
        f"{base}/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlrequest.urlopen(req, timeout=40) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"].strip()
    except (urlerror.URLError, urlerror.HTTPError, KeyError, IndexError, TimeoutError, json.JSONDecodeError):
        return None


def handle_chat(
    *,
    message: str,
    session_id: str,
    history: list[dict[str, str]] | None = None,
    contact: str | None = None,
    data_root: Path,
    pasted_text: str | None = None,
) -> dict[str, Any]:
    message = (message or "").strip()
    history = history or []
    if not message and not pasted_text:
        return {
            "ok": True,
            "intent": "empty",
            "reply": "Напишите вопрос или загрузите рукопись для технической предпроверки.",
        }

    if pasted_text and (wants_check(message) or not message):
        analysis = analyze_manuscript(pasted_text, filename="pasted.txt")
        return {"ok": True, "intent": "manuscript_check", "reply": analysis["reply"], "analysis": analysis}

    if wants_operator(message):
        ticket = create_operator_ticket(
            data_root=data_root,
            message=message,
            session_id=session_id or "anon",
            contact=contact,
            history=history,
        )
        return {"ok": True, "intent": "operator", **ticket}

    if wants_check(message):
        # Long pasted manuscript in the same message (after a short trigger phrase).
        body = message
        for prefix in (
            "проверь рукопись",
            "проверь статью",
            "проверь",
            "check manuscript",
            "check:",
        ):
            if body.lower().startswith(prefix):
                body = body[len(prefix) :].lstrip(" :\n")
                break
        if len(body) >= 500 and body != message:
            analysis = analyze_manuscript(body, filename="pasted.txt")
            return {
                "ok": True,
                "intent": "manuscript_check",
                "reply": analysis["reply"],
                "analysis": analysis,
            }
        if len(message) >= 1200 and _looks_like_manuscript(message):
            analysis = analyze_manuscript(message, filename="pasted.txt")
            return {
                "ok": True,
                "intent": "manuscript_check",
                "reply": analysis["reply"],
                "analysis": analysis,
            }
        return {
            "ok": True,
            "intent": "need_manuscript",
            "reply": (
                "Могу сделать техническую предпроверку рукописи через Python: "
                "число символов/слов, эвристика разделов, замечания по комплектности.\n\n"
                "Прикрепите файл (.txt, .docx, .tex, .pdf*, .zip) кнопкой «Проверить рукопись» "
                "или отправьте: «проверь:» и далее текст рукописи.\n"
                "*PDF — если установлен pypdf."
            ),
        }

    faq = match_faq(message)
    if faq:
        return {"ok": True, "intent": "faq", "faqId": faq["id"], "reply": faq["answer_ru"]}

    llm = _optional_llm_reply(message, history)
    if llm:
        return {"ok": True, "intent": "llm", "reply": llm}

    return {
        "ok": True,
        "intent": "fallback",
        "reply": (
            "Я помощник редакции BSM. Могу ответить про подачу, APC, сроки, открытый доступ, "
            "тематику, отрицательные результаты и выпуски; сделать техническую предпроверку "
            "рукописи (символы, разделы); либо передать вопрос оператору.\n\n"
            "Примеры: «Сколько стоит APC?», «Как подать статью?», «Проверь рукопись», "
            "«Вызови оператора».\n\n"
            f"Почта редакции: {JOURNAL['contact_email']}"
        ),
    }


def welcome_message() -> str:
    return (
        f"Редакционный агент · {JOURNAL['name']} ({JOURNAL['short']})\n\n"
        "Полный режим (server.py): FAQ, проверка TXT/DOCX/PDF*, тикеты оператору"
        f"{' + LLM' if (os.environ.get('BS_OPENAI_API_KEY') or os.environ.get('OPENAI_API_KEY')) else ''}.\n"
        "На GitHub Pages доступен витринный агент (FAQ + текстовая проверка) без этого API.\n\n"
        "Не принимаю статьи и не выношу решение о публикации — только поддержка и первичный техскрининг."
    )
