# Аудит Biological Systems and Methods (BSM)

Дата: 2026-07-21  
Сайт: https://arinaatom-cyber.github.io/biological-systems-and-methods/  
Репозиторий: https://github.com/arinaatom-cyber/biological-systems-and-methods  

Проверки: `python tools/audit_site.py` · `python tools/revision_check.py` · live HTTP probe

---

## Итог

| Уровень | Результат |
|---------|-----------|
| Critical | **0** |
| High | **0** |
| Medium | **1** (описания типов статей — только RU) |
| Revision checklist | **19 ok · 0 fail** |
| Live Pages | **главная и ассеты 200** |

**Вердикт:** витрина честная и рабочая. Фейковых статей, ISSN, DOI и редколлегии нет. Бренд и лицензия согласованы.

---

## Live (GitHub Pages)

| Проверка | Статус |
|----------|--------|
| Home / index.html | 200, бренд BSM |
| config.js / site.js / i18n.js / chatbot.js / styles.css | 200 |
| articles.json | `[]` |
| policies.html, submit.html, issues.html | 200 |
| Нет `Biological Systems And Methods` (Title Case) | OK |
| Нет сырого `chat.launcher` в HTML | OK |
| `/api/chat/*` | нет (ожидаемо для статики) |

### ИИ-агент на Pages vs локально

| Среда | Поведение |
|-------|-----------|
| **GitHub Pages** | Скрипт `chatbot.js` грузится, **кнопка чата скрыта**: на статическом хосте нет Python API. Это сделано намеренно (`staticHost` / `github.io`). |
| **Локально** `python server.py` | Полный агент: FAQ, проверка рукописи, вызов оператора → http://127.0.0.1:5173 |

Чтобы агент отвечал «в интернете», нужен бэкенд (свой VPS / Railway / Fly.io с `server.py`), не только Pages.

---

## Честность данных

| Параметр | Значение |
|----------|----------|
| articles / issues / authors / editors | 0 |
| articles.json / editors.json | пусто |
| issn / eissn | null → «—» |
| licenseAppliedToPublishedContent | false (планируемая CC BY 4.0) |
| conferenceEnabled | false |
| submissionMode | local (OJS ещё не подключён) |
| doiInfrastructureActive | false |

---

## Контент и навигация

| Пункт | Статус |
|-------|--------|
| Biological Systems and Methods / Биологические системы и методы / BSM | OK |
| Редакционные политики | OK |
| Исправления и ретракции | OK |
| Академичные темы выпусков 1–4 | OK |
| chat.launcher RU/EN/ZH | OK |
| Типы рукописей: тексты описаний EN/ZH | **Medium** — пока русские тела |

---

## Безопасность / формы

| Пункт | Статус |
|-------|--------|
| `.private` / inbox не отдаются по HTTP | OK |
| Submit не заявляет acceptance | OK |
| Secrets не в репозитории (`.env` в gitignore) | OK |

---

## Что не закрыто аудитом (не баги витрины)

1. **OJS** — ещё не установлен; кнопка подачи на локальную форму.  
2. **Юрлицо / главред / ISSN** — вне кода.  
3. **Полный агент в проде** — нужен хостинг `server.py`.  
4. **i18n тел политик и article-types** — shell trilingual, длинные HTML ещё RU-first.

---

## Повторный прогон

```bash
python tools/revision_check.py
python tools/audit_site.py
```
