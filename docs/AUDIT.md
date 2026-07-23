# Аудит Biological Systems and Methods (BSM)

Дата: 2026-07-23 (обновление агента)  
Сайт: https://arinaatom-cyber.github.io/biological-systems-and-methods/  
Репозиторий: https://github.com/arinaatom-cyber/biological-systems-and-methods  

Проверки: `python tools/audit_site.py` · `python tools/revision_check.py`

---

## Итог

| Уровень | Результат |
|---------|-----------|
| Critical | **0** |
| High | **0** |
| Medium | **1** (описания article-types — RU-only) |
| Revision | **19 ok · 0 fail** |
| Live Pages | **200** |

**Вердикт:** витрина честная; гибридный ИИ-агент обновлён.

---

## ИИ-агент (обновление)

| Режим | Где | Возможности |
|-------|-----|-------------|
| **Витринный** | GitHub Pages | FAQ (APC, подача, сроки, OA, scope, выпуски, NR…), проверка `.txt/.md/.tex`, оператор через `mailto` |
| **Полный** | `python server.py` | Всё выше + DOCX/PDF*/ZIP, серверные тикеты, опциональный LLM |

Файлы: `assets/js/editorial-agent.js` · `assets/js/chatbot.js` · `editorial_agent.py`

Кнопка «Чат редакции» снова доступна на Pages (витринный режим).

---

## Честность данных

| Параметр | Значение |
|----------|----------|
| articles / issues / editors | 0 / пустые JSON |
| issn | null → «—» |
| licenseAppliedToPublishedContent | false |
| conferenceEnabled | false |
| submissionMode | local |

---

## Medium / вне кода

1. i18n тел article-types (EN/ZH)  
2. OJS ещё не подключён  
3. Юрлицо / ISSN / редколлегия — по roadmap  

---

## Повтор

```bash
python tools/revision_check.py
python tools/audit_site.py
```
