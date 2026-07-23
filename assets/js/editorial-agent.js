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
      ? "Полный режим: FAQ, проверка файлов (в т.ч. DOCX/PDF*), тикеты оператору."
      : "Витринный режим (GitHub Pages): FAQ и проверка вставленного/текстового файла. DOCX/PDF и серверные тикеты — при запуске python server.py.";
    return (
      `Редакционный агент · ${NAME()} (BSM)\n\n${mode}\n\n` +
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

    const linesOut = [
      "Техническая предпроверка (не рецензирование и не решение редакции).",
      "",
      `Файл: ${filename || "вставленный текст"}`,
      `Символов (с пробелами): ${chars.toLocaleString("ru-RU")}`,
      `Символов (без пробелов): ${charsNs.toLocaleString("ru-RU")}`,
      `Слов (эвристика): ${words.toLocaleString("ru-RU")}`,
      `Непустых строк: ${lines}`,
      `Язык текста: ${lang}`,
      "",
      "Обнаруженные разделы:",
      found.length ? found.map((x) => `• ${x}`).join("\n") : "• не распознаны",
      "",
      "Возможно отсутствуют:",
      missing.length ? missing.slice(0, 8).map((x) => `• ${x}`).join("\n") : "• явных пропусков не видно",
    ];
    if (warnings.length) {
      linesOut.push("", "Замечания:", ...warnings.map((w) => `• ${w}`));
    }
    linesOut.push(
      "",
      "Далее: приведите рукопись к инструкциям и подайте через форму / OJS. Отчёт не гарантирует принятие."
    );
    return {
      intent: "manuscript_check",
      chars,
      words,
      reply: linesOut.join("\n"),
    };
  }

  function operatorMailto(message) {
    const subject = encodeURIComponent(`[BSM] Обращение из чата · ${NAME()}`);
    const body = encodeURIComponent(
      `Сообщение:\n${message || "Нужна помощь редакции"}\n\nСтраница: ${location.href}\n`
    );
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
          "Могу посчитать символы/слова и эвристику разделов.\n\n" +
          "• Прикрепите .txt/.md/.tex или вставьте текст («проверь: …»)\n" +
          "• DOCX/PDF — в полном режиме с python server.py",
      };
    }
    const faq = matchFaq(text);
    if (faq) return faq;
    return {
      intent: "fallback",
      reply:
        "Я помощник редакции BSM. Спросите про APC, подачу, сроки, OA, тематику, выпуски, отрицательные результаты " +
        `или попросите проверить рукопись.\n\nПочта: ${EMAIL()}`,
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
    email: EMAIL,
  };
})();
