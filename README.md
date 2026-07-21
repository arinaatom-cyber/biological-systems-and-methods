# Biological Systems and Methods (BSM)

**Биологические системы и методы**  
*An International Journal of Biological Research and Methodology*

Папка проекта: `C:\Users\Arina1996\Projects\bioscientia`

## Запуск (полный: сайт + чат + подача)

```bash
cd C:\Users\Arina1996\Projects\bioscientia
python server.py
```

Открыть: http://127.0.0.1:5173

Публичная витрина (статика) деплоится на **GitHub Pages** из ветки `master` (workflow `.github/workflows/pages.yml`).  
На Pages работают страницы журнала; чат и API подачи — только через `python server.py`.

## План и аудит

- Дорожная карта: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- OJS: [`docs/ojs-setup.md`](docs/ojs-setup.md)
- Аудит: [`docs/AUDIT.md`](docs/AUDIT.md)
- Проверки: `python tools/revision_check.py` · `python tools/audit_site.py`

## Конфигурация

- Канон: `src/config/journal.ts`
- Runtime: `assets/js/config.js`
- Подача: `submissionMode: "local"` → форма на сайте; `"ojs"` + `ojsUrl` → Open Journal Systems
- Сокращение: `journalNameShort: "BSM"`

## Редакционный агент

Чат на сайте (`chatEnabled: true`): FAQ, техпроверка рукописи (символы/разделы), вызов оператора.  
Опционально LLM: `BS_OPENAI_API_KEY` в `.env`.

## Шаблон рукописи

```bash
python tools/build_manuscript_template.py
```

Файл: `templates/BSM-manuscript-template.docx`
