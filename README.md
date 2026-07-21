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

**Репозиторий:** https://github.com/arinaatom-cyber/biological-systems-and-methods  

**Публичная витрина (GitHub Pages):** https://arinaatom-cyber.github.io/biological-systems-and-methods/  

На Pages — статическая витрина. Чат и API подачи работают только локально через `python server.py`.

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
