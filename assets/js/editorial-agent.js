/**
 * Client-side editorial agent for Biological Systems and Methods (BSM).
 * Works on static hosts (GitHub Pages). Server.py adds PDF/DOCX check + tickets + optional LLM.
 */
(() => {
  const CFG = () => window.BS_CONFIG || {};
  const NAME = () => CFG().journalName || "Biological Systems and Methods";
  const EMAIL = () =>
    CFG().emails?.coordinator || CFG().temporaryEmail || CFG().editorialEmail || "arina.atom@gmail.com";
  const APC = () => window.BS?.formatApcAll?.() || "75 000 RUB / 6 000 CNY";
  const SUBMIT = () => window.BS?.submitHref?.() || "submit.html";

  const SECTION_HINTS = [
    ["название", /\b(title|название)\b/i],
    ["аннотация", /\b(abstract|аннотация|резюме)\b/i],
    ["ключевые слова", /\b(keywords?|ключевые слова)\b/i],
    ["введение", /\b(introduction|введение)\b/i],
    ["материалы и методы", /\b(materials?\s+and\s+methods|методы|материалы и методы)\b/i],
    ["результаты", /\b(results?|результаты)\b/i],
    ["обсуждение", /\b(discussion|обсуждение)\b/i],
    ["список литературы", /\b(references|литература|bibliography)\b/i],
    ["доступность данных", /\b(data availability|доступность данных)\b/i],
    ["финансирование", /\b(funding|финансирование|acknowledgements?|благодарности)\b/i],
    ["конфликт интересов", /\b(conflict of interest|конфликт.*интерес)/i],
  ];

  function facts() {
    const c = CFG();
    const license = c.license || "CC BY 4.0";
    const planned = c.licenseAppliedToPublishedContent
      ? `Лицензия: ${license}.`
      : `Планируемая модель: открытый доступ, лицензия ${license}.`;
    return {
      days: c.firstDecisionDaysTarget || 21,
      issues: c.issuesPerYear || 4,
      issn: c.issn || c.eissn || "—",
      planned,
    };
  }

  const FAQ = [
    {
      id: "apc",
      re: /(apc|стоимост|оплат|плат[её]|fee|charge|публикац.*сбор|сколько.*(стоит|cost)|price)/i,
      answer: () =>
        `Сбор за обработку статьи (Article Processing Charge, APC): ${APC()}.\n\n` +
        "Подача и рецензирование бесплатны. APC только после принятия и не влияет на редакционное решение. " +
        "Способность автора оплатить APC не учитывается при научной оценке.\n\nПодробнее: apc.html",
    },
    {
      id: "submit",
      re: /(подат|отправ|как.*рукопис|submit|upload|загруз)/i,
      answer: () =>
        `Как подать рукопись:\n1. Откройте «Подать рукопись» → ${SUBMIT()}\n` +
        "2. Метаданные → авторы → файлы → декларации\n" +
        "3. PDF/DOCX (или LaTeX ZIP) и сопроводительное письмо\n\n" +
        "Подтверждение получения ≠ решение о принятии.\nИнструкции: authors-guidelines.html",
    },
    {
      id: "review",
      re: /(реценз|peer.?review|сроки?|first decision|21\s*дн)/i,
      answer: () => {
        const f = facts();
        return (
          `Целевой срок до первого решения — ${f.days} дней (зависит от темы и рецензентов). ` +
          "Рецензирование double-blind. Решения принимают научные редакторы; автоматизация не выносит вердикт.\n" +
          "Политика: peer-review.html"
        );
      },
    },
    {
      id: "oa",
      re: /(открыт.*доступ|open access|cc\s*by|лиценз)/i,
      answer: () => {
        const f = facts();
        return `${f.planned} ISSN пока: ${f.issn}.\nСтраница: open-access.html`;
      },
    },
    {
      id: "scope",
      re: /(тематик|scope|aims|что публик|подходит ли)/i,
      answer: () =>
        `${NAME()} публикует экспериментальные, вычислительные и методологические исследования биологических систем ` +
        "(биология, биоинформатика и омикс, биохимия, биофизика, методы и воспроизводимость), " +
        "включая методологически обоснованные отрицательные и нулевые результаты.\naims.html",
    },
    {
      id: "negative",
      re: /(отрицательн|нулев|negative|null result|registered report)/i,
      answer: () =>
        "Отрицательные, нулевые и неожиданные результаты оцениваются по дизайну, выборке, статистике, " +
        "воспроизводимости и значимости вопроса. Отсутствие значимости само по себе не основание для публикации.\n" +
        "Требования: negative-results.html",
    },
    {
      id: "types",
      re: /(тип.*рукопис|article type|какие статьи)/i,
      answer: () =>
        "Типы: оригинальные исследования, методы, протоколы, краткие сообщения, обзоры, ПО, базы данных, " +
        "отрицательные/нулевые результаты, репликации, Registered Reports.\narticle-types.html",
    },
    {
      id: "issues",
      re: /(выпуск|том\s*1|issue|volume)/i,
      answer: () => {
        const f = facts();
        return (
          `Том 1 · 2026 — ${f.issues} выпуска:\n` +
          "• № 1 — Биологические системы и экспериментальные методы\n" +
          "• № 2 — Вычислительная биология и омиксные технологии\n" +
          "• № 3 — Отрицательные, нулевые и неожиданные результаты\n" +
          "• № 4 — Обзоры, достижения и перспективы\n\nissues.html"
        );
      },
    },
    {
      id: "ai",
      re: /(\bии\b|\bai\b|chatgpt|генератив)/i,
      answer: () =>
        "Генеративный ИИ нельзя указывать автором; использование нужно раскрыть. " +
        "Этот чат не принимает рукописи и не выносит решение о публикации.\nai-policy.html",
    },
    {
      id: "contact",
      re: /(контакт|email|почт|связ)/i,
      answer: () => `Редакция: ${EMAIL()}\ncontact.html\nИли кнопка «Вызвать оператора» в чате.`,
    },
  ];

  function welcome(serverOnline) {
    const mode = serverOnline
      ? "Полный режим: FAQ, проверка файлов (DOCX/PDF*), комментарии «что исправить», отчёт редакции."
      : "Витринный режим: FAQ, проверка текста/.txt, комментарии с примерами правок, отправка отчёта на email редакции.";
    return (
      `Редакционный агент · ${NAME()} (BSM)\n\n${mode}\n\n` +
      "Загрузите файл или напишите «проверь: …» — получите % готовности, список правок и пример ответа автору.\n" +
      "Не принимаю статьи и не выношу решение о публикации."
    );
  }

  function matchFaq(message) {
    const text = String(message || "").trim();
    if (!text) return null;
    for (const item of FAQ) {
      if (item.re.test(text)) return { intent: "faq", faqId: item.id, reply: item.answer() };
    }
    return null;
  }

  function wantsOperator(message) {
    return /(оператор|человек|менеджер|human|operator|живой|не помог|эскалац)/i.test(message || "");
  }

  function wantsCheck(message) {
    return /(провер|прескрин|pre-?check|pre-?screen|символ|character|word count|объ[её]м|посмотр.*стать|рукопис|manuscript)/i.test(
      message || ""
    );
  }

  function buildFixes(found, missing, chars, words, lang, clean, warnings) {
    const items = [];
    const add = (severity, title, detail, example) => items.push({ severity, title, detail, example });
    const core = new Set([
      "аннотация",
      "введение",
      "материалы и методы",
      "результаты",
      "обсуждение",
      "список литературы",
    ]);

    for (const label of missing) {
      if (label === "аннотация") {
        add(
          "high",
          "Добавьте аннотацию (Abstract)",
          "Аннотация не распознана. Нужен блок 150–250 слов: цель, методы, главный результат, вывод.",
          "Abstract\nWe tested whether X affects Y in Z cells (n = 12). Mean difference was 0.4 (95% CI 0.1–0.7)."
        );
      } else if (label === "материалы и методы") {
        add(
          "high",
          "Расширьте «Материалы и методы»",
          "Укажите дизайн, выборку, репликаты, статистику и ПО с версиями.",
          "Materials and Methods\nSample size was justified a priori. Analyses used R 4.3; code deposited at…"
        );
      } else if (label === "доступность данных") {
        add(
          "high",
          "Укажите доступность данных",
          "Обязателен Data availability: репозиторий/URL или обоснованное None.",
          "Data availability\nRaw data: https://zenodo.org/… — or: None (summary in Supplement)."
        );
      } else if (label === "конфликт интересов") {
        add(
          "medium",
          "Добавьте конфликты интересов",
          "Нужна явная декларация COI.",
          "Conflicts of interest\nThe authors declare no competing interests."
        );
      } else if (label === "финансирование") {
        add(
          "medium",
          "Укажите финансирование",
          "Грант/номер или явное None.",
          "Funding\nSupported by Grant No. … / None."
        );
      } else if (core.has(label)) {
        add(
          "high",
          `Добавьте раздел «${label}»`,
          "Заголовок не распознан — оформите отдельным разделом.",
          `${label}\n[Краткое содержание…]`
        );
      } else {
        add("low", `Проверьте «${label}»`, "Маркер раздела не найден.", `${label}\n…`);
      }
    }

    if (chars < 1500 || words < 250) {
      add(
        "high",
        "Текст слишком короткий",
        "Похоже на фрагмент, а не полную рукопись.",
        "Title → Abstract → Introduction → Methods → Results → Discussion → References"
      );
    } else if (words < 1500) {
      add(
        "medium",
        "Проверьте полноту / тип рукописи",
        "Мало слов для original research — если short communication, укажите тип явно.",
        "Article type: Short Communication"
      );
    }

    if (!/\b(n\s*=|sample size|размер выборк|biological replicate)/i.test(clean)) {
      add(
        "medium",
        "Уточните размер выборки / репликаты",
        "Не видно n / sample size / biological vs technical replicates.",
        "We analysed n = 18 biological replicates (3 technical replicates each)."
      );
    }
    if (!/\b(p\s*[<=>]|95%\s*ci|confidence interval|доверительн|effect size|размер эффект)/i.test(clean)) {
      add(
        "medium",
        "Усильте статистическую отчётность",
        "Укажите p-value и/или размер эффекта с ДИ.",
        "Mean difference = 1.2 (95% CI 0.4–2.0), p = 0.01."
      );
    }

    for (const w of warnings) {
      add("medium", "Техническое замечание", w, "Исправьте файл и повторите проверку.");
    }

    const seen = new Set();
    return items.filter((it) => (seen.has(it.title) ? false : seen.add(it.title))).slice(0, 12);
  }

  function analyzeText(text, filename) {
    const clean = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const chars = clean.length;
    const charsNs = clean.replace(/\s+/g, "").length;
    const words = (clean.match(/[A-Za-zА-Яа-яЁё0-9\-']+/g) || []).length;
    const lines = clean.split("\n").filter((l) => l.trim()).length;
    const cyr = (clean.match(/[А-Яа-яЁё]/g) || []).length;
    const lat = (clean.match(/[A-Za-z]/g) || []).length;
    const lang = !cyr && !lat ? "не определён" : cyr >= lat ? "русский (эвристика)" : "английский (эвристика)";
    const found = [];
    const missing = [];
    for (const [label, re] of SECTION_HINTS) {
      (re.test(clean) ? found : missing).push(label);
    }
    const warnings = [];
    if (chars < 1500) warnings.push("Текст очень короткий — возможно, загружен фрагмент.");
    if (chars > 250000) warnings.push("Текст очень длинный; убедитесь, что это рукопись.");

    const fixes = buildFixes(found, missing, chars, words, lang, clean, warnings);
    const high = fixes.filter((f) => f.severity === "high").length;
    const medium = fixes.filter((f) => f.severity === "medium").length;
    const sectionScore = Math.round((100 * found.length) / Math.max(SECTION_HINTS.length, 1));
    const readiness = clean.trim()
      ? Math.max(5, Math.min(98, sectionScore - Math.min(60, high * 12 + medium * 5)))
      : 0;
    let verdict =
      "Рукопись пока не готова к подаче: не хватает ключевых разделов или объёма.";
    if (readiness >= 75 && high === 0) {
      verdict = "Технически близко к подаче — устраните оставшиеся замечания и подайте рукопись.";
    } else if (readiness >= 45) {
      verdict = "Требуется доработка перед подачей (см. «Что исправить»).";
    }

    const badge = { high: "ВЫСОКИЙ", medium: "СРЕДНИЙ", low: "НИЗКИЙ" };
    const out = [
      "Предпроверка рукописи BSM (техническая; не рецензирование и не решение редакции)",
      "════════════════════════════════════════",
      `Файл: ${filename || "вставленный текст"}`,
      `Объём: ${chars.toLocaleString("ru-RU")} симв. · ${words.toLocaleString("ru-RU")} слов · ${lines} строк`,
      `Язык (эвристика): ${lang}`,
      `Готовность к подаче (техскрининг): ${readiness}%`,
      `Вердикт: ${verdict}`,
      "",
      "Чек-лист разделов:",
      ...SECTION_HINTS.map(([label]) => `  ${found.includes(label) ? "✓" : "✗"} ${label}`),
      "",
      "Что исправить (приоритет):",
    ];

    if (!fixes.length) {
      out.push("  • Критичных технических пробелов не видно. Проверьте смысл и рисунки вручную.");
    } else {
      fixes.forEach((item, i) => {
        out.push(
          `${i + 1}. [${badge[item.severity] || item.severity}] ${item.title}`,
          `   ${item.detail}`,
          "   Пример, как улучшить:",
          "   ┌─",
          ...item.example.split("\n").map((ln) => `   │ ${ln}`),
          "   └─",
          ""
        );
      });
    }

    out.push(
      "Пример итогового ответа автору:",
      "┌─",
      `│ Уважаемый автор, по файлу «${filename || "manuscript"}» выполнен технический прескрин BSM.`,
      `│ Оценка готовности: ${readiness}%. ${verdict}`,
      "│ Главное к исправлению:"
    );
    (fixes.slice(0, 3).length ? fixes.slice(0, 3) : [{ title: "Существенных технических пробелов не выявлено" }]).forEach(
      (item) => out.push(`│ — ${item.title}`)
    );
    out.push(
      "│ После правок повторите проверку в чате и подайте рукопись.",
      "│ Это не решение о принятии.",
      "└─",
      "",
      "Отправить замечания редакции: кнопка «Отправить отчёт редакции» или напишите «отправь отчёт».",
      `Подача: ${SUBMIT()} · Инструкции: authors-guidelines.html`
    );

    const editorialReport = [
      `[BSM pre-check] ${filename || "manuscript"}`,
      `Readiness: ${readiness}%`,
      `Chars/words: ${chars}/${words}`,
      `Language: ${lang}`,
      `Missing: ${missing.join(", ") || "—"}`,
      "",
      "Fixes:",
      ...fixes.map((f) => `- [${f.severity}] ${f.title}: ${f.detail}`),
      "",
      `Page: ${typeof location !== "undefined" ? location.href : ""}`,
    ].join("\n");

    return {
      intent: "manuscript_check",
      chars,
      words,
      readiness,
      verdict,
      fixes,
      editorialReport,
      filename: filename || "pasted.txt",
      reply: out.join("\n"),
    };
  }

  function operatorMailto(message) {
    const subject = encodeURIComponent(`[BSM] Обращение из чата · ${NAME()}`);
    const body = encodeURIComponent(
      `Сообщение:\n${message || "Нужна помощь редакции"}\n\nСтраница: ${location.href}\n`
    );
    return `mailto:${EMAIL()}?subject=${subject}&body=${body}`;
  }

  function reportMailto(editorialReport) {
    const subject = encodeURIComponent(`[BSM] Отчёт предпроверки рукописи`);
    const body = encodeURIComponent(editorialReport || "Отчёт пуст");
    return `mailto:${EMAIL()}?subject=${subject}&body=${body}`;
  }

  function respondLocal(message, opts = {}) {
    const text = String(message || "").trim();
    const pasted = opts.pastedText || "";

    if (pasted && (wantsCheck(text) || !text || pasted.length > 400)) {
      return analyzeText(pasted, opts.filename || "pasted.txt");
    }
    if (wantsOperator(text)) {
      return {
        intent: "operator_local",
        reply:
          `На витрине тикеты сервера недоступны. Откроется письмо оператору (${EMAIL()}).\n` +
          "Для серверных тикетов запустите python server.py локально.",
        mailto: operatorMailto(text),
      };
    }
    if (/(отправь отчёт|отправь отчет|send report|отправ.*редакц)/i.test(text)) {
      return {
        intent: "send_report",
        reply:
          "Чтобы отправить отчёт, сначала выполните проверку файла. Затем нажмите «Отправить отчёт редакции» " +
          "или повторите команду сразу после проверки.",
      };
    }

    if (wantsCheck(text)) {
      let body = text;
      for (const prefix of ["проверь рукопись", "проверь статью", "проверь", "check manuscript", "check:"]) {
        if (body.toLowerCase().startsWith(prefix)) {
          body = body.slice(prefix.length).replace(/^[\s:]+/, "");
          break;
        }
      }
      if (body.length >= 500 && body !== text) return analyzeText(body, "pasted.txt");
      return {
        intent: "need_manuscript",
        reply:
          "Загрузите рукопись (📎) или вставьте текст: «проверь: …».\n\n" +
          "Вы получите: % готовности, чек-лист разделов, приоритетные правки с примерами и шаблон ответа автору.\n" +
          "• .txt/.md/.tex — здесь\n• DOCX/PDF — с python server.py",
      };
    }
    const faq = matchFaq(text);
    if (faq) return faq;
    return {
      intent: "fallback",
      reply:
        "Я помощник редакции BSM.\n\n" +
        "• Стандартные вопросы: APC, подача, сроки, OA, выпуски, отрицательные результаты\n" +
        "• Предпроверка файла: % готовности + «что исправить» с примерами\n" +
        "• Отправка замечаний редакции: после проверки → «Отправить отчёт редакции»\n\n" +
        `Почта: ${EMAIL()}`,
    };
  }

  window.BSEditorialAgent = {
    welcome,
    respondLocal,
    analyzeText,
    matchFaq,
    wantsOperator,
    wantsCheck,
    operatorMailto,
    reportMailto,
    email: EMAIL,
  };
})();
