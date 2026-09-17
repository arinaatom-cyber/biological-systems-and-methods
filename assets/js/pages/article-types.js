(() => {
  const TYPES = [
    {
      id: "original-research",
      name: "Original Research",
      purpose: {
        ru: "Полноформатные исследования с гипотезой, методами, результатами и обсуждением.",
        en: "Full-length studies with a hypothesis, methods, results and discussion.",
        zh: "含假设、方法、结果与讨论的完整研究。",
        ar: "بحوث كاملة بفرضية وطرائق ونتائج ومناقشة.",
      },
      structure: {
        ru: "IMRaD",
        en: "IMRaD",
        zh: "IMRaD",
        ar: "IMRaD",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: {
        ru: "обязательна при новых данных",
        en: "required when new data are generated",
        zh: "产生新数据时必须提供",
        ar: "إلزامية عند بيانات جديدة",
      },
      code: {
        ru: "обязателен при вычислительных методах",
        en: "required for computational methods",
        zh: "计算方法必须提供",
        ar: "إلزامي للطرائق الحاسوبية",
      },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "methods",
      name: "Methods",
      purpose: {
        ru: "Новые или существенно усовершенствованные методы.",
        en: "New or substantially improved methods.",
        zh: "新方法或显著改进的方法。",
        ar: "طرائق جديدة أو محسّنة جوهريًا.",
      },
      structure: {
        ru: "Контекст → протокол → валидация",
        en: "Context → protocol → validation",
        zh: "背景 → 方案 → 验证",
        ar: "سياق → بروتوكول → تحقق",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "рекомендуется", en: "recommended", zh: "建议提供", ar: "موصى بها" },
      code: {
        ru: "обязателен для вычислительных методов",
        en: "required for computational methods",
        zh: "计算方法必须提供",
        ar: "إلزامي للطرائق الحاسوبية",
      },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "short-communications",
      name: "Short Communications",
      purpose: {
        ru: "Краткие сообщения о значимых результатах.",
        en: "Short reports of significant findings.",
        zh: "重要结果的简短报告。",
        ar: "رسائل موجزة عن نتائج ذات أهمية.",
      },
      structure: {
        ru: "Краткий IMRaD",
        en: "Short IMRaD",
        zh: "简短 IMRaD",
        ar: "IMRaD موجز",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "reviews",
      name: "Reviews",
      purpose: {
        ru: "Критические обзоры литературы.",
        en: "Critical literature reviews.",
        zh: "批判性文献综述。",
        ar: "مراجعات نقدية للأدبيات.",
      },
      structure: {
        ru: "Тематические разделы",
        en: "Thematic sections",
        zh: "主题章节",
        ar: "أقسام موضوعية",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: {
        ru: "обычно не требуются",
        en: "usually not required",
        zh: "通常不需要",
        ar: "لا تُطلب عادة",
      },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "systematic-reviews",
      name: "Systematic Reviews",
      purpose: {
        ru: "Систематические обзоры по протоколу.",
        en: "Protocol-based systematic reviews.",
        zh: "按方案进行的系统综述。",
        ar: "مراجعات منهجية وفق بروتوكول.",
      },
      structure: {
        ru: "PRISMA-ориентированная структура",
        en: "PRISMA-oriented structure",
        zh: "面向 PRISMA 的结构",
        ar: "بنية موجهة بـ PRISMA",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: {
        ru: "поисковые стратегии",
        en: "search strategies",
        zh: "检索策略",
        ar: "استراتيجيات البحث",
      },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "meta-analyses",
      name: "Meta-analyses",
      purpose: {
        ru: "Количественный синтез доказательств.",
        en: "Quantitative evidence synthesis.",
        zh: "证据的定量综合。",
        ar: "تركيب كمّي للأدلة.",
      },
      structure: {
        ru: "Протокол → методы → результаты",
        en: "Protocol → methods → results",
        zh: "方案 → 方法 → 结果",
        ar: "بروتوكول → طرائق → نتائج",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: {
        ru: "исходные оценки эффектов",
        en: "source effect estimates",
        zh: "原始效应估计",
        ar: "تقديرات الأثر الأصلية",
      },
      code: { ru: "рекомендуется", en: "recommended", zh: "建议提供", ar: "موصى بها" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "perspectives",
      name: "Perspectives",
      purpose: {
        ru: "Аналитические перспективы и позиции.",
        en: "Analytical perspectives and position pieces.",
        zh: "分析性展望与观点。",
        ar: "رؤى تحليلية ومواقف.",
      },
      structure: {
        ru: "Аргументированное эссе",
        en: "Argumentative essay",
        zh: "论证性文章",
        ar: "مقالة حججية",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: {
        ru: "обычно не требуются",
        en: "usually not required",
        zh: "通常不需要",
        ar: "لا تُطلب عادة",
      },
      code: {
        ru: "обычно не требуется",
        en: "usually not required",
        zh: "通常不需要",
        ar: "لا تُطلب عادة",
      },
      review: {
        ru: "редакционная / экспертная оценка",
        en: "editorial / expert assessment",
        zh: "编辑 / 专家评估",
        ar: "تقييم تحريري / خبير",
      },
    },
    {
      id: "data-notes",
      name: "Data Notes",
      purpose: {
        ru: "Описание наборов данных.",
        en: "Descriptions of datasets.",
        zh: "数据集说明。",
        ar: "وصف مجموعات البيانات.",
      },
      structure: {
        ru: "Контекст → методы сбора → доступ",
        en: "Context → collection methods → access",
        zh: "背景 → 采集方法 → 获取",
        ar: "سياق → طرائق الجمع → الوصول",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "обязательна", en: "required", zh: "必须提供", ar: "إلزامية" },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "software-notes",
      name: "Software Notes",
      purpose: {
        ru: "Описание исследовательского ПО.",
        en: "Descriptions of research software.",
        zh: "研究软件说明。",
        ar: "وصف برمجيات البحث.",
      },
      structure: {
        ru: "Назначение → архитектура → пример",
        en: "Purpose → architecture → example",
        zh: "用途 → 架构 → 示例",
        ar: "الغرض → البنية → مثال",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: {
        ru: "тестовые данные",
        en: "test data",
        zh: "测试数据",
        ar: "بيانات اختبار",
      },
      code: { ru: "обязателен", en: "required", zh: "必须提供", ar: "إلزامي" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "database-articles",
      name: "Database Articles",
      purpose: {
        ru: "Описание биологических баз данных.",
        en: "Descriptions of biological databases.",
        zh: "生物学数据库说明。",
        ar: "وصف قواعد البيانات البيولوجية.",
      },
      structure: {
        ru: "Содержание → курация → доступ",
        en: "Content → curation → access",
        zh: "内容 → 策展 → 获取",
        ar: "المحتوى → التنسيق → الوصول",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: {
        ru: "обязательна схема доступа",
        en: "access scheme required",
        zh: "必须提供访问方案",
        ar: "مخطط الوصول إلزامي",
      },
      code: {
        ru: "API/скрипты по возможности",
        en: "API/scripts where possible",
        zh: "尽可能提供 API/脚本",
        ar: "واجهات برمجية/سكربتات إن أمكن",
      },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "negative-results",
      name: "Negative Results",
      purpose: {
        ru: "Методологически обоснованные отрицательные результаты.",
        en: "Methodologically sound negative results.",
        zh: "方法学上可靠的阴性结果。",
        ar: "نتائج سلبية سليمة منهجيًا.",
      },
      structure: {
        ru: "Гипотеза → мощность → результаты → ограничения",
        en: "Hypothesis → power → results → limitations",
        zh: "假设 → 效能 → 结果 → 局限",
        ar: "فرضية → القوة → نتائج → قيود",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "обязательна", en: "required", zh: "必须提供", ar: "إلزامية" },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "null-findings",
      name: "Null Findings",
      purpose: {
        ru: "Нулевые результаты с корректной статистической интерпретацией.",
        en: "Null findings with a correct statistical interpretation.",
        zh: "有正确统计解释的零结果。",
        ar: "نتائج صفرية بتفسير إحصائي صحيح.",
      },
      structure: {
        ru: "Гипотеза → анализ → интерпретация",
        en: "Hypothesis → analysis → interpretation",
        zh: "假设 → 分析 → 解释",
        ar: "فرضية → تحليل → تفسير",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "обязательна", en: "required", zh: "必须提供", ar: "إلزامية" },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "replication-studies",
      name: "Replication Studies",
      purpose: {
        ru: "Повторные исследования.",
        en: "Replication studies.",
        zh: "重复研究。",
        ar: "دراسات تكرار.",
      },
      structure: {
        ru: "Исходная работа → протокол → сравнение",
        en: "Original work → protocol → comparison",
        zh: "原研究 → 方案 → 比较",
        ar: "العمل الأصلي → بروتوكول → مقارنة",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "обязательна", en: "required", zh: "必须提供", ar: "إلزامية" },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "независимое рецензирование",
        en: "independent peer review",
        zh: "独立审稿",
        ar: "تحكيم علمي مستقل",
      },
    },
    {
      id: "registered-reports",
      name: "Registered Reports",
      purpose: {
        ru: "Протокол с рецензированием до сбора данных.",
        en: "Protocol peer-reviewed before data collection.",
        zh: "在收集数据前接受审稿的方案。",
        ar: "بروتوكول يُحكَّم قبل جمع البيانات.",
      },
      structure: {
        ru: "Stage 1 / Stage 2",
        en: "Stage 1 / Stage 2",
        zh: "Stage 1 / Stage 2",
        ar: "المرحلة 1 / المرحلة 2",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "план данных", en: "data plan", zh: "数据计划", ar: "خطة البيانات" },
      code: { ru: "план анализа", en: "analysis plan", zh: "分析计划", ar: "خطة التحليل" },
      review: {
        ru: "двухэтапное рецензирование",
        en: "two-stage peer review",
        zh: "两阶段审稿",
        ar: "تحكيم على مرحلتين",
      },
    },
    {
      id: "protocols",
      name: "Protocols",
      purpose: {
        ru: "Подробные экспериментальные или вычислительные протоколы.",
        en: "Detailed experimental or computational protocols.",
        zh: "详细的实验或计算方案。",
        ar: "بروتوكولات تجريبية أو حاسوبية مفصّلة.",
      },
      structure: {
        ru: "Пошаговый протокол",
        en: "Step-by-step protocol",
        zh: "逐步方案",
        ar: "بروتوكول خطوة بخطوة",
      },
      abstract: { ru: "да", en: "yes", zh: "是", ar: "نعم" },
      data: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "редакционная / экспертная оценка",
        en: "editorial / expert assessment",
        zh: "编辑 / 专家评估",
        ar: "تقييم تحريري / خبير",
      },
    },
    {
      id: "interviews",
      name: "Interviews",
      purpose: {
        ru: "Интервью с исследователями.",
        en: "Interviews with researchers.",
        zh: "研究者访谈。",
        ar: "مقابلات مع الباحثين.",
      },
      structure: {
        ru: "Введение → диалог",
        en: "Introduction → dialogue",
        zh: "引言 → 对话",
        ar: "مقدمة → حوار",
      },
      abstract: { ru: "краткая", en: "short", zh: "简短", ar: "موجز" },
      data: {
        ru: "не требуются",
        en: "not required",
        zh: "不需要",
        ar: "غير مطلوبة",
      },
      code: { ru: "не требуется", en: "not required", zh: "不需要", ar: "غير مطلوبة" },
      review: {
        ru: "редакционная оценка",
        en: "editorial assessment",
        zh: "编辑评估",
        ar: "تقييم تحريري",
      },
    },
    {
      id: "success-stories",
      name: "Success Stories",
      purpose: {
        ru: "Истории развития научных проектов.",
        en: "Stories of scientific project development.",
        zh: "科研项目发展故事。",
        ar: "قصص تطور المشاريع العلمية.",
      },
      structure: {
        ru: "Контекст → путь → уроки",
        en: "Context → path → lessons",
        zh: "背景 → 路径 → 经验",
        ar: "سياق → مسار → دروس",
      },
      abstract: { ru: "краткая", en: "short", zh: "简短", ar: "موجز" },
      data: {
        ru: "не требуются",
        en: "not required",
        zh: "不需要",
        ar: "غير مطلوبة",
      },
      code: { ru: "не требуется", en: "not required", zh: "不需要", ar: "غير مطلوبة" },
      review: {
        ru: "редакционная оценка",
        en: "editorial assessment",
        zh: "编辑评估",
        ar: "تقييم تحريري",
      },
    },
    {
      id: "editorials",
      name: "Editorials",
      purpose: {
        ru: "Редакционные материалы.",
        en: "Editorial pieces.",
        zh: "社论。",
        ar: "مواد تحريرية.",
      },
      structure: { ru: "Свободная", en: "Free", zh: "自由", ar: "حرّة" },
      abstract: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      data: {
        ru: "не требуются",
        en: "not required",
        zh: "不需要",
        ar: "غير مطلوبة",
      },
      code: { ru: "не требуется", en: "not required", zh: "不需要", ar: "غير مطلوبة" },
      review: {
        ru: "редакционная оценка",
        en: "editorial assessment",
        zh: "编辑评估",
        ar: "تقييم تحريري",
      },
    },
    {
      id: "corrections",
      name: "Corrections",
      purpose: {
        ru: "Исправления к опубликованным статьям.",
        en: "Corrections to published articles.",
        zh: "对已发表文章的更正。",
        ar: "تصحيحات للمقالات المنشورة.",
      },
      structure: {
        ru: "Описание ошибки и правки",
        en: "Description of the error and the correction",
        zh: "错误说明与更正",
        ar: "وصف الخطأ والتصحيح",
      },
      abstract: { ru: "нет", en: "no", zh: "无", ar: "لا" },
      data: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      code: { ru: "по необходимости", en: "as needed", zh: "视需要", ar: "حسب الحاجة" },
      review: {
        ru: "редакционная оценка",
        en: "editorial assessment",
        zh: "编辑评估",
        ar: "تقييم تحريري",
      },
    },
  ];

  function t(key) {
    return window.BSi18n?.t(key) || key;
  }

  function loc(map) {
    if (!map || typeof map !== "object") return "";
    const lang = window.BSi18n?.getLanguage?.() || "ru";
    return map[lang] || map.en || map.ru || "";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function paint() {
    const root = document.getElementById("article-types-root");
    if (!root) return;
    const volumeNote = t("type.volume.note");
    root.innerHTML = TYPES.map((row) => {
      return `
        <article class="type-card" id="${row.id}">
          <h2>${escapeHtml(row.name)}</h2>
          <dl>
            <dt>${escapeHtml(t("type.field.purpose"))}</dt><dd>${escapeHtml(loc(row.purpose))}</dd>
            <dt>${escapeHtml(t("type.field.structure"))}</dt><dd>${escapeHtml(loc(row.structure))}</dd>
            <dt>${escapeHtml(t("type.field.abstract"))}</dt><dd>${escapeHtml(loc(row.abstract))}</dd>
            <dt>${escapeHtml(t("type.field.data"))}</dt><dd>${escapeHtml(loc(row.data))}</dd>
            <dt>${escapeHtml(t("type.field.code"))}</dt><dd>${escapeHtml(loc(row.code))}</dd>
            <dt>${escapeHtml(t("type.field.volume"))}</dt><dd>${escapeHtml(volumeNote)}</dd>
            <dt>${escapeHtml(t("type.field.review"))}</dt><dd>${escapeHtml(loc(row.review))}</dd>
          </dl>
        </article>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", paint);
  window.addEventListener("bs:langchange", paint);
})();
