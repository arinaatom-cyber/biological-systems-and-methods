(() => {
  const NAME = "Biological Systems and Methods";
  const headers = {
    ru: {
      about: { kicker: "О журнале", h1: NAME, lede: "Рецензируемый журнал открытого доступа по биологии, биоинформатике, биохимии и биофизике.", title: "О журнале" },
      aims: { kicker: "О журнале", h1: "Цели и тематика", lede: "Журнал публикует исследования, направленные на получение воспроизводимых и интерпретируемых результатов в науках о жизни.", title: "Цели и тематика" },
      publisher: { kicker: "О журнале", h1: "Издатель", lede: "Юридические и издательские сведения заполняются после регистрации организации.", title: "Издатель" },
      "open-access": { kicker: "О журнале", h1: "Модель открытого доступа", lede: "Планируемая лицензия публикации: CC BY 4.0.", title: "Открытый доступ" },
      history: { kicker: "О журнале", h1: "История журнала", title: "История журнала" },
      news: { kicker: "О журнале", h1: "Новости", title: "Новости" },
      contact: { kicker: "Контакты", h1: "Контакты", lede: "Редакционный офис", title: "Контакты" },
      authors: { kicker: "Авторам", h1: "Авторам", lede: "Подача и рецензирование бесплатны. APC взимается только после принятия статьи.", title: "Авторам" },
      "authors-guidelines": { kicker: "Авторам", h1: "Инструкции авторам", lede: "Обязательные разделы рукописи и требования к данным.", title: "Инструкции авторам" },
      "authors-files": { kicker: "Авторам", h1: "Подготовка файлов", title: "Подготовка файлов" },
      "article-types": { kicker: "Авторам", h1: "Типы публикаций", lede: "Для каждого типа указаны назначение, структура, данные, код и формат рецензирования.", title: "Типы публикаций" },
      apc: { kicker: "Авторам", h1: "Стоимость публикации", lede: "Подача и рецензирование бесплатны. APC взимается только после принятия рукописи.", title: "APC" },
      "data-policy": { kicker: "Авторам", h1: "Политика данных и кода", lede: "Данные и код должны быть доступны в объёме, достаточном для проверки основных результатов, кроме ограничений конфиденциальности, биоэтики или закона.", title: "Данные и код" },
      "negative-results": { kicker: "Материалы", h1: "Отрицательные результаты — с тем же стандартом научной оценки", lede: "Журнал рассматривает отрицательные, нулевые и неожиданные результаты по качеству дизайна, статистике, воспроизводимости и научной значимости вопроса.", title: "Отрицательные результаты" },
      editors: { kicker: "Редакторам и рецензентам", h1: "Редакторам", title: "Редакторам" },
      reviewers: { kicker: "Редакторам и рецензентам", h1: "Рецензентам", title: "Рецензентам" },
      "editors-guide": { kicker: "Редакторам", h1: "Руководство для редакторов", lede: "Ответственный редактор оценивает соответствие тематике, качество дизайна и полноту деклараций, подбирает рецензентов и принимает решение.", title: "Руководство для редакторов" },
      "reviewers-guide": { kicker: "Рецензентам", h1: "Руководство для рецензентов", lede: "Рецензент оценивает дизайн, статистику, воспроизводимость, интерпретацию и соответствие типу статьи.", title: "Руководство для рецензентов" },
      editorial: { kicker: "О журнале", h1: "Редакционная коллегия", lede: "Коллегия формируется по направлениям Biology, Bioinformatics, Biochemistry, Biophysics, Reproducibility and Methodology.", title: "Редакционная коллегия" },
      policies: { kicker: "Редакционные политики", h1: "Редакционные политики журнала", lede: "Процедуры разработаны с учётом международно признанных принципов публикационной этики.", title: "Редакционные политики" },
      "peer-review": { kicker: "Редакционные политики", h1: "Рецензирование", lede: "Редакционная предварительная оценка и независимое научное рецензирование.", title: "Рецензирование" },
      "publication-ethics": { kicker: "Редакционные политики", h1: "Публикационная этика", lede: "Процедуры разработаны с учётом международно признанных принципов публикационной этики.", title: "Публикационная этика" },
      authorship: { kicker: "Редакционные политики", h1: "Авторство", lede: "Авторство определяется существенным вкладом в исследование и ответственностью за содержание работы.", title: "Авторство" },
      conflicts: { kicker: "Редакционные политики", h1: "Конфликты интересов", lede: "Все потенциальные конфликты интересов должны быть раскрыты.", title: "Конфликты интересов" },
      "research-ethics": { kicker: "Редакционные политики", h1: "Этика исследований", lede: "Исследования с участием людей или животных должны сопровождаться необходимыми одобрениями.", title: "Этика исследований" },
      corrections: { kicker: "Редакционные политики", h1: "Исправления и ретракции", title: "Исправления и ретракции" },
      complaints: { kicker: "Редакционные политики", h1: "Жалобы и апелляции", title: "Жалобы и апелляции" },
      misconduct: { kicker: "Редакционные политики", h1: "Нарушения", title: "Нарушения" },
      "image-integrity": { kicker: "Редакционные политики", h1: "Целостность изображений", title: "Целостность изображений" },
      "duplicate-publication": { kicker: "Редакционные политики", h1: "Повторные публикации", title: "Повторные публикации" },
      plagiarism: { kicker: "Редакционные политики", h1: "Плагиат и переработка текста", title: "Плагиат" },
      preprint: { kicker: "Редакционные политики", h1: "Препринты", lede: "Препринты допускаются при раскрытии ссылки.", title: "Препринты" },
      confidentiality: { kicker: "Редакционные политики", h1: "Конфиденциальность", title: "Конфиденциальность" },
      advertising: { kicker: "Редакционные политики", h1: "Реклама и спонсорство", title: "Реклама" },
      "editorial-independence": { kicker: "Редакционные политики", h1: "Редакционная независимость", title: "Редакционная независимость" },
      "ai-policy": { kicker: "Редакционные политики", h1: "Использование ИИ", title: "Использование ИИ" },
      "language-policy": { kicker: "Редакционные политики", h1: "Языковая политика", title: "Языковая политика" },
      process: { kicker: "Авторам", h1: "Процесс публикации", lede: "От создания учётной записи до публикации и подготовки метаданных.", title: "Процесс публикации" },
      privacy: { kicker: "Правовая информация", h1: "Конфиденциальность", lede: "Персональные данные обрабатываются только в объёме, необходимом для редакционной работы и поддержки сайта.", title: "Конфиденциальность" },
      terms: { kicker: "Правовая информация", h1: "Условия использования", title: "Условия использования" },
      cookies: { kicker: "Правовая информация", h1: "Политика cookie", title: "Cookie" },
      accessibility: { kicker: "Правовая информация", h1: "Доступность", lede: "Семантическая разметка, клавиатурная навигация, видимый фокус и достаточный контраст.", title: "Доступность" },
      conferences: { kicker: "Конференции", h1: "Конференции", title: "Конференции" },
      issues: { kicker: "Выпуски", title: "Выпуски" },
      submit: { kicker: "Авторам", h1: "Подать рукопись", lede: "Подача и рецензирование бесплатны. APC взимается только после принятия рукописи и не влияет на редакционное решение.", title: "Подать рукопись" },
      join: { kicker: "Редакторам и рецензентам", h1: "Стать редактором или рецензентом", title: "Стать редактором или рецензентом" },
      login: { kicker: "Аккаунт", h1: "Вход", lede: "Войдите через Яндекс, Mail.ru, Gmail или ORCID, чтобы подавать рукописи и сохранять черновики.", title: "Вход" },
      account: { kicker: "Аккаунт", h1: "Аккаунт", title: "Аккаунт" },
      article: { kicker: "Материалы", title: "Статья" },
    },
    en: {
      about: { kicker: "About", h1: NAME, lede: "A peer-reviewed open access journal in biology, bioinformatics, biochemistry and biophysics.", title: "About" },
      aims: { kicker: "About", h1: "Aims & scope", lede: "The journal publishes research aimed at reproducible, interpretable results in the life sciences.", title: "Aims & scope" },
      publisher: { kicker: "About", h1: "Publisher", lede: "Legal and publisher details will be added after the organisation is registered.", title: "Publisher" },
      "open-access": { kicker: "About", h1: "Open access model", lede: "Planned publication licence: CC BY 4.0.", title: "Open access" },
      history: { kicker: "About", h1: "Journal history", title: "Journal history" },
      news: { kicker: "About", h1: "News", title: "News" },
      contact: { kicker: "Contact", h1: "Contact", lede: "Editorial office", title: "Contact" },
      authors: { kicker: "Authors", h1: "Authors", lede: "Submission and peer review are free of charge. APC is charged only after acceptance.", title: "Authors" },
      "authors-guidelines": { kicker: "Authors", h1: "Author guidelines", lede: "Required manuscript sections and data reporting.", title: "Author guidelines" },
      "authors-files": { kicker: "Authors", h1: "File preparation", title: "File preparation" },
      "article-types": { kicker: "Authors", h1: "Article types", lede: "Each type lists purpose, structure, data, code and peer-review format.", title: "Article types" },
      apc: { kicker: "Authors", h1: "Publication fees", lede: "Submission and peer review are free. APC is charged only after acceptance.", title: "APC" },
      "data-policy": { kicker: "Authors", h1: "Data & code policy", lede: "Data and code should be available to the extent needed to verify the main results, except where confidentiality, research ethics or law restrict access.", title: "Data & code" },
      "negative-results": { kicker: "Materials", h1: "Negative results — the same scientific standard", lede: "The journal considers negative, null and unexpected results on study design, statistics, reproducibility and the scientific importance of the question.", title: "Negative results" },
      editors: { kicker: "Editors & reviewers", h1: "Editors", title: "Editors" },
      reviewers: { kicker: "Editors & reviewers", h1: "Reviewers", title: "Reviewers" },
      "editors-guide": { kicker: "Editors", h1: "Editor guide", lede: "The handling editor assesses scope, design quality and declarations, selects reviewers and makes the decision.", title: "Editor guide" },
      "reviewers-guide": { kicker: "Reviewers", h1: "Reviewer guide", lede: "Reviewers assess design, statistics, reproducibility, interpretation and fit to the article type.", title: "Reviewer guide" },
      editorial: { kicker: "About", h1: "Editorial board", lede: "The board is being formed across Biology, Bioinformatics, Biochemistry, Biophysics, and Reproducibility and Methodology.", title: "Editorial board" },
      policies: { kicker: "Editorial policies", h1: "Editorial policies", lede: "Procedures follow internationally recognised publication-ethics principles.", title: "Editorial policies" },
      "peer-review": { kicker: "Editorial policies", h1: "Peer review", lede: "Editorial screening and independent scientific peer review.", title: "Peer review" },
      "publication-ethics": { kicker: "Editorial policies", h1: "Publication ethics", lede: "Procedures follow internationally recognised publication-ethics principles.", title: "Publication ethics" },
      authorship: { kicker: "Editorial policies", h1: "Authorship", lede: "Authorship requires a substantial contribution and responsibility for the work.", title: "Authorship" },
      conflicts: { kicker: "Editorial policies", h1: "Conflicts of interest", lede: "All potential conflicts of interest must be disclosed.", title: "Conflicts of interest" },
      "research-ethics": { kicker: "Editorial policies", h1: "Research ethics", lede: "Studies involving humans or animals require the necessary approvals.", title: "Research ethics" },
      corrections: { kicker: "Editorial policies", h1: "Corrections & retractions", title: "Corrections & retractions" },
      complaints: { kicker: "Editorial policies", h1: "Complaints & appeals", title: "Complaints & appeals" },
      misconduct: { kicker: "Editorial policies", h1: "Misconduct", title: "Misconduct" },
      "image-integrity": { kicker: "Editorial policies", h1: "Image integrity", title: "Image integrity" },
      "duplicate-publication": { kicker: "Editorial policies", h1: "Duplicate publication", title: "Duplicate publication" },
      plagiarism: { kicker: "Editorial policies", h1: "Plagiarism and text recycling", title: "Plagiarism" },
      preprint: { kicker: "Editorial policies", h1: "Preprints", lede: "Preprints are allowed when the link is disclosed.", title: "Preprints" },
      confidentiality: { kicker: "Editorial policies", h1: "Confidentiality", title: "Confidentiality" },
      advertising: { kicker: "Editorial policies", h1: "Advertising & sponsorship", title: "Advertising" },
      "editorial-independence": { kicker: "Editorial policies", h1: "Editorial independence", title: "Editorial independence" },
      "ai-policy": { kicker: "Editorial policies", h1: "AI use", title: "AI use" },
      "language-policy": { kicker: "Editorial policies", h1: "Language policy", title: "Language policy" },
      process: { kicker: "Authors", h1: "Publication process", lede: "From account creation to publication and metadata preparation.", title: "Publication process" },
      privacy: { kicker: "Legal", h1: "Privacy", lede: "Personal data are processed only as needed for editorial work and site support.", title: "Privacy" },
      terms: { kicker: "Legal", h1: "Terms of use", title: "Terms of use" },
      cookies: { kicker: "Legal", h1: "Cookie policy", title: "Cookies" },
      accessibility: { kicker: "Legal", h1: "Accessibility", lede: "Semantic markup, keyboard navigation, visible focus and sufficient contrast.", title: "Accessibility" },
      conferences: { kicker: "Conferences", h1: "Conferences", title: "Conferences" },
      issues: { kicker: "Issues", title: "Issues" },
      submit: { kicker: "Authors", h1: "Submit manuscript", lede: "Submission and peer review are free. APC is charged only after acceptance and does not affect the editorial decision.", title: "Submit manuscript" },
      join: { kicker: "Editors & reviewers", h1: "Become an editor or reviewer", title: "Become an editor or reviewer" },
      login: { kicker: "Account", h1: "Sign in", lede: "Sign in with Yandex, Mail.ru, Gmail or ORCID to submit manuscripts and save drafts.", title: "Sign in" },
      account: { kicker: "Account", h1: "Account", title: "Account" },
      article: { kicker: "Materials", title: "Article" },
    },
    zh: {
      about: { kicker: "关于期刊", h1: NAME, lede: "生物、生物信息学、生物化学与生物物理学领域的同行评议开放获取期刊。", title: "关于期刊" },
      aims: { kicker: "关于期刊", h1: "办刊宗旨", lede: "本刊发表旨在获得可重复、可解释结果的生命科学研究。", title: "办刊宗旨" },
      publisher: { kicker: "关于期刊", h1: "出版方", lede: "法律与出版信息将在机构注册后补充。", title: "出版方" },
      "open-access": { kicker: "关于期刊", h1: "开放获取模式", lede: "计划采用 CC BY 4.0 许可。", title: "开放获取" },
      history: { kicker: "关于期刊", h1: "期刊历史", title: "期刊历史" },
      news: { kicker: "关于期刊", h1: "新闻", title: "新闻" },
      contact: { kicker: "联系", h1: "联系", lede: "编辑部", title: "联系" },
      authors: { kicker: "作者指南", h1: "作者指南", lede: "投稿与审稿免费。APC 仅在录用后收取。", title: "作者指南" },
      "authors-guidelines": { kicker: "作者指南", h1: "投稿须知", lede: "稿件必备章节与数据报告要求。", title: "投稿须知" },
      "authors-files": { kicker: "作者指南", h1: "文件准备", title: "文件准备" },
      "article-types": { kicker: "作者指南", h1: "文章类型", lede: "各类型列出目的、结构、数据、代码与审稿方式。", title: "文章类型" },
      apc: { kicker: "作者指南", h1: "出版费用", lede: "投稿与审稿免费。APC 仅在录用后收取。", title: "APC" },
      "data-policy": { kicker: "作者指南", h1: "数据与代码政策", lede: "数据和代码应在足以核验主要结果的范围内开放，保密、伦理或法律限制除外。", title: "数据与代码" },
      "negative-results": { kicker: "内容", h1: "阴性结果——同一科学标准", lede: "本刊依据研究设计、统计分析、可重复性与科学问题的重要性评估阴性、零结果与意外结果。", title: "阴性结果" },
      editors: { kicker: "编辑与审稿人", h1: "编辑", title: "编辑" },
      reviewers: { kicker: "编辑与审稿人", h1: "审稿人", title: "审稿人" },
      "editors-guide": { kicker: "编辑", h1: "编辑指南", lede: "责任编辑评估范围、设计质量与声明，邀请审稿人并作出决定。", title: "编辑指南" },
      "reviewers-guide": { kicker: "审稿人", h1: "审稿指南", lede: "审稿人评估设计、统计、可重复性、解释及与文章类型的匹配。", title: "审稿指南" },
      editorial: { kicker: "关于期刊", h1: "编委会", lede: "编委会按生物学、生物信息学、生物化学、生物物理学以及可重复性与方法论组建。", title: "编委会" },
      policies: { kicker: "编辑政策", h1: "编辑政策", lede: "程序遵循国际公认的出版伦理原则。", title: "编辑政策" },
      "peer-review": { kicker: "编辑政策", h1: "同行评议", lede: "编辑初审与独立科学审稿。", title: "同行评议" },
      "publication-ethics": { kicker: "编辑政策", h1: "出版伦理", lede: "程序遵循国际公认的出版伦理原则。", title: "出版伦理" },
      authorship: { kicker: "编辑政策", h1: "作者贡献", lede: "作者身份要求对研究有实质性贡献并对内容负责。", title: "作者贡献" },
      conflicts: { kicker: "编辑政策", h1: "利益冲突", lede: "所有潜在利益冲突均须披露。", title: "利益冲突" },
      "research-ethics": { kicker: "编辑政策", h1: "研究伦理", lede: "涉及人或动物的研究须具备必要批准。", title: "研究伦理" },
      corrections: { kicker: "编辑政策", h1: "更正与撤稿", title: "更正与撤稿" },
      complaints: { kicker: "编辑政策", h1: "投诉与申诉", title: "投诉与申诉" },
      misconduct: { kicker: "编辑政策", h1: "不端行为", title: "不端行为" },
      "image-integrity": { kicker: "编辑政策", h1: "图像完整性", title: "图像完整性" },
      "duplicate-publication": { kicker: "编辑政策", h1: "重复发表", title: "重复发表" },
      plagiarism: { kicker: "编辑政策", h1: "剽窃与文本再利用", title: "剽窃" },
      preprint: { kicker: "编辑政策", h1: "预印本", lede: "在披露链接的前提下允许预印本。", title: "预印本" },
      confidentiality: { kicker: "编辑政策", h1: "保密", title: "保密" },
      advertising: { kicker: "编辑政策", h1: "广告与赞助", title: "广告" },
      "editorial-independence": { kicker: "编辑政策", h1: "编辑独立", title: "编辑独立" },
      "ai-policy": { kicker: "编辑政策", h1: "人工智能使用", title: "人工智能使用" },
      "language-policy": { kicker: "编辑政策", h1: "语言政策", title: "语言政策" },
      process: { kicker: "作者指南", h1: "出版流程", lede: "从创建账户到发表与元数据准备。", title: "出版流程" },
      privacy: { kicker: "法律信息", h1: "隐私", lede: "仅在编辑工作与网站支持所需范围内处理个人数据。", title: "隐私" },
      terms: { kicker: "法律信息", h1: "使用条款", title: "使用条款" },
      cookies: { kicker: "法律信息", h1: "Cookie 政策", title: "Cookie" },
      accessibility: { kicker: "法律信息", h1: "无障碍", lede: "语义标记、键盘导航、可见焦点与足够对比度。", title: "无障碍" },
      conferences: { kicker: "会议", h1: "会议", title: "会议" },
      issues: { kicker: "卷期", title: "卷期" },
      submit: { kicker: "作者指南", h1: "投稿", lede: "投稿与审稿免费。APC 仅在录用后收取，且不影响编辑决定。", title: "投稿" },
      join: { kicker: "编辑与审稿人", h1: "成为编辑或审稿人", title: "成为编辑或审稿人" },
      login: { kicker: "账户", h1: "登录", lede: "通过 Yandex、Mail.ru、Gmail 或 ORCID 登录以投稿并保存草稿。", title: "登录" },
      account: { kicker: "账户", h1: "账户", title: "账户" },
      article: { kicker: "内容", title: "文章" },
    },
  };

  const cards = {
    ru: {
      "aims.html": { title: "Цели и тематика", blurb: "Направления журнала и критерии рассмотрения." },
      "editorial.html": { title: "Редакционная коллегия", blurb: "Состав формируется; вымышленные профили не публикуются." },
      "publisher.html": { title: "Издатель", blurb: "Юридические сведения после регистрации организации." },
      "open-access.html": { title: "Модель открытого доступа", blurb: "Планируемая лицензия CC BY 4.0." },
      "history.html": { title: "История журнала", blurb: "Хронология редакции." },
      "news.html": { title: "Новости", blurb: "Сообщения редакции." },
      "contact.html": { title: "Контакты", blurb: "Редакционный офис." },
      "authors-guidelines.html": { title: "Инструкции авторам", blurb: "Структура рукописи и требования к материалам." },
      "article-types.html": { title: "Типы рукописей", blurb: "Исследования, методы, обзоры, отрицательные результаты и др." },
      "authors-files.html": { title: "Подготовка файлов", blurb: "Форматы изображений, таблиц и приложений." },
      "process.html": { title: "Процесс публикации", blurb: "Этапы от подачи до публикации." },
      "apc.html": { title: "APC", blurb: "Сбор только после принятия рукописи." },
      "publication-ethics.html": { title: "Публикационная этика", blurb: "Авторство, оригинальность, этика исследований." },
      "submit.html": { title: "Подать рукопись", blurb: "Форма подачи рукописи." },
      "editors-guide.html": { title: "Руководство для редакторов", blurb: "Этапы оценки и принятия решений." },
      "reviewers-guide.html": { title: "Руководство для рецензентов", blurb: "Критерии и этика рецензирования." },
      "join.html": { title: "Стать редактором или рецензентом", blurb: "Заявка в редакционную коллегию или пул рецензентов." },
      "confidentiality.html": { title: "Конфиденциальность", blurb: "Обращение с неопубликованными материалами." },
      "ai-policy.html": { title: "Использование ИИ", blurb: "Ограничения для редакции и рецензентов." },
      "conflicts.html": { title: "Конфликты интересов", blurb: "Декларация и управление конфликтами." },
      "peer-review.html": { title: "Рецензирование", blurb: "Этапы и возможные решения." },
      "authorship.html": { title: "Авторство", blurb: "Критерии авторства и CRediT." },
      "research-ethics.html": { title: "Этика исследований", blurb: "Требования к этике исследований." },
      "corrections.html": { title: "Исправления и ретракции", blurb: "Исправления, выражения обеспокоенности и ретракции." },
      "complaints.html": { title: "Жалобы и апелляции", blurb: "Порядок подачи жалоб и апелляций." },
      "misconduct.html": { title: "Нарушения", blurb: "Расследование нарушений публикационной этики." },
      "image-integrity.html": { title: "Целостность изображений", blurb: "Требования к рисункам и правкам." },
      "duplicate-publication.html": { title: "Повторные публикации", blurb: "Дублирование и пересечение рукописей." },
      "plagiarism.html": { title: "Плагиат и переработка текста", blurb: "Проверка оригинальности и самоцитирование." },
      "preprint.html": { title: "Препринты", blurb: "Правила размещения препринтов." },
      "advertising.html": { title: "Реклама и спонсорство", blurb: "Разграничение редакции и рекламы." },
      "editorial-independence.html": { title: "Редакционная независимость", blurb: "Независимость редакционных решений." },
      "language-policy.html": { title: "Языковая политика", blurb: "Язык записи и переводы." },
      "data-policy.html": { title: "Данные и код", blurb: "Доступность материалов исследования." },
    },
    en: {
      "aims.html": { title: "Aims & scope", blurb: "Journal scope and assessment criteria." },
      "editorial.html": { title: "Editorial board", blurb: "The board is being formed; invented profiles are not published." },
      "publisher.html": { title: "Publisher", blurb: "Legal details after organisational registration." },
      "open-access.html": { title: "Open access model", blurb: "Planned licence: CC BY 4.0." },
      "history.html": { title: "Journal history", blurb: "Editorial timeline." },
      "news.html": { title: "News", blurb: "Editorial announcements." },
      "contact.html": { title: "Contact", blurb: "Editorial office." },
      "authors-guidelines.html": { title: "Author guidelines", blurb: "Manuscript structure and reporting requirements." },
      "article-types.html": { title: "Article types", blurb: "Research, methods, reviews, negative results and more." },
      "authors-files.html": { title: "File preparation", blurb: "Figures, tables and supplements." },
      "process.html": { title: "Publication process", blurb: "Steps from submission to publication." },
      "apc.html": { title: "APC", blurb: "Charged only after acceptance." },
      "publication-ethics.html": { title: "Publication ethics", blurb: "Authorship, originality and research ethics." },
      "submit.html": { title: "Submit manuscript", blurb: "Manuscript submission form." },
      "editors-guide.html": { title: "Editor guide", blurb: "Assessment and decision steps." },
      "reviewers-guide.html": { title: "Reviewer guide", blurb: "Review criteria and ethics." },
      "join.html": { title: "Become an editor or reviewer", blurb: "Apply to the editorial board or reviewer pool." },
      "confidentiality.html": { title: "Confidentiality", blurb: "Handling unpublished materials." },
      "ai-policy.html": { title: "AI use", blurb: "Limits for editors and reviewers." },
      "conflicts.html": { title: "Conflicts of interest", blurb: "Declaration and management of COI." },
      "peer-review.html": { title: "Peer review", blurb: "Stages and possible decisions." },
      "authorship.html": { title: "Authorship", blurb: "Authorship criteria and CRediT." },
      "research-ethics.html": { title: "Research ethics", blurb: "Requirements for research ethics." },
      "corrections.html": { title: "Corrections & retractions", blurb: "Corrections, expressions of concern and retractions." },
      "complaints.html": { title: "Complaints & appeals", blurb: "How to submit complaints and appeals." },
      "misconduct.html": { title: "Misconduct", blurb: "Investigation of publication-ethics breaches." },
      "image-integrity.html": { title: "Image integrity", blurb: "Requirements for figures and edits." },
      "duplicate-publication.html": { title: "Duplicate publication", blurb: "Overlap and redundant manuscripts." },
      "plagiarism.html": { title: "Plagiarism and text recycling", blurb: "Originality checks and self-citation." },
      "preprint.html": { title: "Preprints", blurb: "Rules for posting preprints." },
      "advertising.html": { title: "Advertising & sponsorship", blurb: "Separation of editorial and advertising." },
      "editorial-independence.html": { title: "Editorial independence", blurb: "Independence of editorial decisions." },
      "language-policy.html": { title: "Language policy", blurb: "Record language and translations." },
      "data-policy.html": { title: "Data & code", blurb: "Availability of research materials." },
    },
    zh: {
      "aims.html": { title: "办刊宗旨", blurb: "期刊范围与评审标准。" },
      "editorial.html": { title: "编委会", blurb: "编委会组建中，不发布虚构人选。" },
      "publisher.html": { title: "出版方", blurb: "机构注册后的法律信息。" },
      "open-access.html": { title: "开放获取模式", blurb: "计划许可：CC BY 4.0。" },
      "history.html": { title: "期刊历史", blurb: "编辑部年表。" },
      "news.html": { title: "新闻", blurb: "编辑部公告。" },
      "contact.html": { title: "联系", blurb: "编辑部。" },
      "authors-guidelines.html": { title: "投稿须知", blurb: "稿件结构与材料要求。" },
      "article-types.html": { title: "文章类型", blurb: "研究、方法、综述、阴性结果等。" },
      "authors-files.html": { title: "文件准备", blurb: "图、表与附件格式。" },
      "process.html": { title: "出版流程", blurb: "从投稿到发表的步骤。" },
      "apc.html": { title: "APC", blurb: "仅在录用后收取。" },
      "publication-ethics.html": { title: "出版伦理", blurb: "作者贡献、原创性与研究伦理。" },
      "submit.html": { title: "投稿", blurb: "稿件提交表单。" },
      "editors-guide.html": { title: "编辑指南", blurb: "评估与决策步骤。" },
      "reviewers-guide.html": { title: "审稿指南", blurb: "审稿标准与伦理。" },
      "join.html": { title: "成为编辑或审稿人", blurb: "申请加入编委会或审稿人库。" },
      "confidentiality.html": { title: "保密", blurb: "未发表材料的处理。" },
      "ai-policy.html": { title: "人工智能使用", blurb: "对编辑与审稿人的限制。" },
      "conflicts.html": { title: "利益冲突", blurb: "利益冲突声明与管理。" },
      "peer-review.html": { title: "同行评议", blurb: "阶段与可能决定。" },
      "authorship.html": { title: "作者贡献", blurb: "作者标准与 CRediT。" },
      "research-ethics.html": { title: "研究伦理", blurb: "研究伦理要求。" },
      "corrections.html": { title: "更正与撤稿", blurb: "更正、关注声明与撤稿。" },
      "complaints.html": { title: "投诉与申诉", blurb: "投诉与申诉程序。" },
      "misconduct.html": { title: "不端行为", blurb: "出版伦理违规调查。" },
      "image-integrity.html": { title: "图像完整性", blurb: "图件与修改要求。" },
      "duplicate-publication.html": { title: "重复发表", blurb: "稿件重叠与重复。" },
      "plagiarism.html": { title: "剽窃与文本再利用", blurb: "原创性检查与自引。" },
      "preprint.html": { title: "预印本", blurb: "预印本发布规则。" },
      "advertising.html": { title: "广告与赞助", blurb: "编辑与广告分离。" },
      "editorial-independence.html": { title: "编辑独立", blurb: "编辑决定的独立性。" },
      "language-policy.html": { title: "语言政策", blurb: "记录语言与翻译。" },
      "data-policy.html": { title: "数据与代码", blurb: "研究材料的可获得性。" },
    },
  };

  const extras = {
    ru: {
      emptyTba: "Информация будет добавлена.",
      confOffTitle: "Конференции",
      confOffBody: "Раздел конференций сейчас не ведётся.",
      historyEmpty: "Хронология и ключевые этапы развития редакции будут опубликованы в этом разделе.",
      newsEmpty: "Новости редакции будут опубликованы в этом разделе.",
      boardEmpty: "Состав редакционной коллегии формируется. Карточки редакторов появятся после подтверждения состава. Вымышленные профили не публикуются.",
      contactCoord: "Email координатора",
      contactSupport: "Техническая поддержка",
      contactSub: "Вопросы о рукописях",
      contactEthics: "Этика и жалобы",
      publisherDts: ["Модель издателя", "Издатель", "Юридическое лицо", "Страна регистрации", "Юридический адрес", "Почтовый адрес", "Регистрационные сведения", "Ответственный издатель"],
      publisherContact: "Контакт координатора:",
      partnersTitle: "Партнёры и спонсоры",
      partnersLede: "Университеты и организации, поддерживающие журнал. Логотипы появятся после заполнения списка партнёров в конфигурации.",
      fundingTitle: "Гранты и финансирование",
      joinLabels: {
        firstName: "Имя *",
        lastName: "Фамилия *",
        degree: "Учёная степень",
        position: "Академическая должность",
        organization: "Организация *",
        country: "Страна *",
        email: "Официальный email *",
        orcid: "ORCID *",
        scopus: "Scopus Author ID",
        wos: "Web of Science ResearcherID",
        interests: "Научные интересы *",
        keywords: "Ключевые слова *",
        reviewExperience: "Опыт рецензирования",
        editorialExperience: "Опыт редакционной работы",
        publications: "Ссылки на публикации",
        role: "Желаемая роль *",
        coi: "Конфликт интересов",
        comment: "Комментарий",
      },
      joinRoles: {
        "section-editor": "Редактор раздела",
        "associate-editor": "Научный редактор",
        reviewer: "Рецензент",
        "statistical-editor": "Статистический редактор",
        "data-editor": "Редактор по данным",
      },
      joinConsent: "Подтверждаю согласие с политиками журнала и обработкой персональных данных *",
      joinSubmit: "Отправить заявку",
      joinDraft: "Сохранить черновик локально",
      joinNote: "Если сервер недоступен, заявка может быть отправлена на email координатора. Успешная отправка подтверждается только после фактической передачи данных.",
      joinPubPlaceholder: "DOI или URL",
      loginOAuth: "Вход работает только для провайдеров с настроенными ключами OAuth (Client ID и Secret). Пока ключи не заданы, кнопка показывает инструкцию — успешный вход не имитируется.",
      loginRedirect: "После настройки добавьте Redirect URI вида http://127.0.0.1:5173/api/auth/callback/… в кабинете провайдера. См. .env.example.",
      submitTemplate: "Скачать шаблон статьи (DOCX)",
      submitGuidelines: "Инструкции авторам",
      submitNew: "Новая подача",
      submitFunding: "Номер гранта / финансирование (Grant Number / Funding) *",
      submitDataIds: "Идентификаторы данных (Data identifiers) *",
      submitDataHint: "Ссылка на Zenodo, GitHub, GEO, SRA и т.п. Если данных нет — укажите обоснование в Data availability и вставьте «None».",
      submitApcNote: " · только после принятия · единый тариф независимо от академического статуса",
      submitFair: "Мои данные соответствуют стандартам FAIR (Findable, Accessible, Interoperable, Reusable), либо я явно обосновал исключения в заявлении о доступности данных.",
    },
    en: {
      emptyTba: "Information will be added.",
      confOffTitle: "Conferences",
      confOffBody: "The conference section is not active.",
      historyEmpty: "The editorial timeline will be published in this section.",
      newsEmpty: "Editorial news will be published in this section.",
      boardEmpty: "The editorial board is being formed. Editor cards will appear after membership is confirmed. Invented profiles are not published.",
      contactCoord: "Coordinator email",
      contactSupport: "Technical support",
      contactSub: "Manuscript queries",
      contactEthics: "Ethics and complaints",
      publisherDts: ["Publisher model", "Publisher", "Legal entity", "Country of registration", "Legal address", "Postal address", "Registration details", "Responsible publisher"],
      publisherContact: "Coordinator contact:",
      partnersTitle: "Partners and sponsors",
      partnersLede: "Universities and organisations supporting the journal. Logos will appear after the partners list is filled in the configuration.",
      fundingTitle: "Grants and funding",
      joinLabels: {
        firstName: "First name *",
        lastName: "Last name *",
        degree: "Academic degree",
        position: "Academic position",
        organization: "Organisation *",
        country: "Country *",
        email: "Official email *",
        orcid: "ORCID *",
        scopus: "Scopus Author ID",
        wos: "Web of Science ResearcherID",
        interests: "Research interests *",
        keywords: "Keywords *",
        reviewExperience: "Reviewing experience",
        editorialExperience: "Editorial experience",
        publications: "Publication links",
        role: "Preferred role *",
        coi: "Conflicts of interest",
        comment: "Comment",
      },
      joinRoles: {
        "section-editor": "Section editor",
        "associate-editor": "Associate editor",
        reviewer: "Reviewer",
        "statistical-editor": "Statistical editor",
        "data-editor": "Data editor",
      },
      joinConsent: "I agree to the journal policies and to the processing of personal data *",
      joinSubmit: "Submit application",
      joinDraft: "Save draft locally",
      joinNote: "If the server is unavailable, the application may be sent to the coordinator email. Success is confirmed only after the data are actually delivered.",
      joinPubPlaceholder: "DOI or URL",
      loginOAuth: "Sign-in works only for providers with configured OAuth keys (Client ID and Secret). Until keys are set, the button shows instructions — a successful login is not simulated.",
      loginRedirect: "After setup, add a Redirect URI of the form http://127.0.0.1:5173/api/auth/callback/… in the provider console. See .env.example.",
      submitTemplate: "Download article template (DOCX)",
      submitGuidelines: "Author guidelines",
      submitNew: "New submission",
      submitFunding: "Grant number / funding *",
      submitDataIds: "Data identifiers *",
      submitDataHint: "Link to Zenodo, GitHub, GEO, SRA or similar. If there are no data, state the reason under Data availability and enter “None”.",
      submitApcNote: " · after acceptance · one rate regardless of academic status",
      submitFair: "My data meet FAIR standards (Findable, Accessible, Interoperable, Reusable), or I have clearly justified exceptions in the data-availability statement.",
    },
    zh: {
      emptyTba: "信息待补充。",
      confOffTitle: "会议",
      confOffBody: "会议栏目目前未启用。",
      historyEmpty: "编辑部年表将在此发布。",
      newsEmpty: "编辑部新闻将在此发布。",
      boardEmpty: "编委会组建中。确认人选后将显示编辑卡片。不发布虚构简介。",
      contactCoord: "协调人邮箱",
      contactSupport: "技术支持",
      contactSub: "稿件问询",
      contactEthics: "伦理与投诉",
      publisherDts: ["出版模式", "出版方", "法律实体", "注册国家", "注册地址", "邮寄地址", "注册信息", "责任出版人"],
      publisherContact: "协调人联系方式：",
      partnersTitle: "合作方与赞助",
      partnersLede: "支持本刊的大学与机构。合作方名单写入配置后将显示标志。",
      fundingTitle: "资助与经费",
      joinLabels: {
        firstName: "名 *",
        lastName: "姓 *",
        degree: "学位",
        position: "学术职务",
        organization: "机构 *",
        country: "国家 *",
        email: "公务邮箱 *",
        orcid: "ORCID *",
        scopus: "Scopus Author ID",
        wos: "Web of Science ResearcherID",
        interests: "研究方向 *",
        keywords: "关键词 *",
        reviewExperience: "审稿经验",
        editorialExperience: "编辑经验",
        publications: "论文链接",
        role: "意向角色 *",
        coi: "利益冲突",
        comment: "备注",
      },
      joinRoles: {
        "section-editor": "栏目编辑",
        "associate-editor": "副编辑",
        reviewer: "审稿人",
        "statistical-editor": "统计编辑",
        "data-editor": "数据编辑",
      },
      joinConsent: "我确认同意期刊政策并同意处理个人数据 *",
      joinSubmit: "提交申请",
      joinDraft: "本地保存草稿",
      joinNote: "若服务器不可用，申请可发送至协调人邮箱。仅在数据实际送达后确认提交成功。",
      joinPubPlaceholder: "DOI 或 URL",
      loginOAuth: "仅在已配置 OAuth 密钥（Client ID 与 Secret）的提供方可用。密钥未设置时按钮显示说明，不会模拟成功登录。",
      loginRedirect: "配置后请在提供方控制台添加形如 http://127.0.0.1:5173/api/auth/callback/… 的 Redirect URI。参见 .env.example。",
      submitTemplate: "下载稿件模板（DOCX）",
      submitGuidelines: "投稿须知",
      submitNew: "新投稿",
      submitFunding: "资助编号 / 经费来源 *",
      submitDataIds: "数据标识符 *",
      submitDataHint: "Zenodo、GitHub、GEO、SRA 等链接。若无数据，请在 Data availability 中说明并填写 “None”。",
      submitApcNote: " · 仅在录用后收取 · 同一费率，与学术身份无关",
      submitFair: "我的数据符合 FAIR（可发现、可访问、可互操作、可重用）标准，或我已在数据可用性声明中明确说明例外。",
    },
  };

  const bodies = {
    ru: {
      "about": [
        "Biological Systems and Methods публикует оригинальные исследования, методы, обзоры, отрицательные, нулевые и неожиданные результаты в области наук о жизни. Редакционные решения принимаются научными редакторами. Автоматизированные инструменты используются только для технической и языковой поддержки."
      ],
      "accessibility": [
        "Если страница недоступна, напишите координатору — мы исправим проблему."
      ],
      "advertising": [
        "Любые будущие партнёрские материалы будут явно отделены от редакционного контента. Спонсорство не влияет на принятие или отклонение рукописей."
      ],
      "aims": [
        "Журнал объединяет экспериментальные, вычислительные и методологические работы и поддерживает публикацию как положительных, так и методологически обоснованных отрицательных результатов."
      ],
      "apc": [
        "или",
        "Единый APC применяется независимо от академического статуса автора. Политика полного и частичного освобождения от оплаты будет опубликована отдельно.",
        "Планируемая структура:",
        "Заявки на освобождение от оплаты начнут рассматриваться после утверждения соответствующей политики."
      ],
      "confidentiality": [
        "Редакторы и рецензенты не передают рукописи третьим лицам и не используют их содержание в собственных интересах. Загрузка в открытые ИИ-сервисы без гарантий конфиденциальности запрещена."
      ],
      "conflicts": [
        "Авторы, редакторы и рецензенты декларируют финансовые, институциональные, персональные и иные отношения, которые могут повлиять на оценку рукописи. При конфликте редактор или рецензент отстраняется от работы с материалом."
      ],
      "cookies": [
        "Сайт может использовать локальное хранилище браузера для языка сайта и черновиков форм. Сторонние рекламные трекеры не используются."
      ],
      "corrections": [
        "Каждая новая версия связывается с исходной статьёй. В структуре статьи предусмотрены поля: version, correctionHistory, retractionStatus, expressionOfConcern, publicationHistory."
      ],
      "duplicate-publication": [
        "Предыдущие публикации (включая препринты) должны быть раскрыты. Переводы и вторичные публикации допускаются только при прозрачной связи с исходной записью и согласии правообладателей."
      ],
      "editorial-independence": [
        "Издатель и спонсоры не вмешиваются в оценку рукописей. APC и коммерческие отношения не определяют исход рецензирования."
      ],
      "editors-guide": [
        "APC не влияет на редакционное решение."
      ],
      "image-integrity": [
        "Допустимы минимальные корректировки яркости/контраста, применяемые ко всему изображению и описанные в методах. Недопустимы выборочное усиление, клонирование, сокрытие и необоснованная сборка панелей."
      ],
      "language-policy": [
        "Английская версия полного текста является основной версией научной публикации, если для конкретной статьи не указано иное. Переводы должны быть связаны с той же записью статьи и содержать указание на основной текст.",
        "Русская, китайская и арабская версии могут содержать название, аннотацию, ключевые слова, сведения об авторах, научно-популярное резюме и перевод интерфейса сайта."
      ],
      "misconduct": [
        "К нарушениям относятся фабрикация и фальсификация данных, плагиат, манипуляции с изображениями, недобросовестное авторство и сокрытие существенных конфликтов интересов. При подтверждении нарушения возможны отклонение, исправление, отзыв статьи и уведомление учреждения."
      ],
      "negative-results": [
        "Само по себе отсутствие статистической значимости не является достаточным основанием для публикации."
      ],
      "open-access": [
        "Biological Systems and Methods публикует материалы в модели открытого доступа. После публикации статьи читатели получают свободный доступ к полному тексту без подписки.",
        "Подача и рецензирование бесплатны. Статья Processing Charge (APC) взимается только после принятия рукописи."
      ],
      "plagiarism": [
        "Заимствования должны быть корректно процитированы. Существенное повторное использование собственного текста без указания источника может рассматриваться как нарушение."
      ],
      "preprint": [
        "Авторы могут размещать рукопись на препринт-сервере до или во время рассмотрения. Ссылка на препринт указывается при подаче и связывается со статьёй после публикации."
      ],
      "privacy": [
        "Данные форм подачи и заявок используются для рассмотрения рукописей и обращений. Рукописи не размещаются в публичных каталогах сайта до публикации. Запросы об удалении черновиков и персональных данных направляйте на email координатора."
      ],
      "publication-ethics": [
        "Журнал ожидает от авторов, редакторов и рецензентов честности, прозрачности и уважения к правам участников исследований. Подробные разделы:"
      ],
      "terms": [
        "Используя сайт, вы соглашаетесь соблюдать редакционные политики и не загружать вредоносные или незаконные материалы. Контент политик и страниц сайта может обновляться; актуальная версия публикуется на соответствующих страницах."
      ],
    },
    en: {
      "about": [
        "Biological Systems and Methods publishes original research, methods, reviews, and negative, null and unexpected results in the life sciences. Editorial decisions are made by scientific editors. Automated tools are used only for technical and language support."
      ],
      "accessibility": [
        "The site uses semantic markup, keyboard navigation and a visible focus state."
      ],
      "advertising": [
        "Advertising copy, if introduced later, will be kept separate from editorial decisions. Sponsorship does not influence the evaluation of manuscripts."
      ],
      "aims": [
        "The journal brings together experimental, computational and methodological work and supports publication of both positive results and methodologically sound negative results."
      ],
      "apc": [
        "or",
        "The APC rate is the same regardless of the author’s academic status. Ability to pay is not considered in the scientific evaluation of a manuscript.",
        "Waiver policy:",
        "A waiver policy will be published only after the full editorial and legal model of the journal is confirmed."
      ],
      "confidentiality": [
        "Manuscripts and reviewer reports are confidential and must not be used for personal or competing purposes. Sharing materials with AI systems without editorial permission is not allowed."
      ],
      "conflicts": [
        "Authors, editors and reviewers must disclose financial, institutional, personal and other relationships that could influence the work. All relevant conflicts are published with the article."
      ],
      "cookies": [
        "The site may use essential technical cookies for language choice and form drafts. Tracking cookies are not used."
      ],
      "corrections": [
        "The journal issues corrections and retractions when required. The record includes version, correctionHistory, retractionStatus, expressionOfConcern and publicationHistory."
      ],
      "duplicate-publication": [
        "Duplicate publication of the same results is not allowed. Overlap with previous work must be disclosed and cited, with a clear statement of what is new."
      ],
      "editorial-independence": [
        "Acceptance and rejection do not depend on the ability to pay. APC and commercial interests do not determine editorial decisions."
      ],
      "editors-guide": [
        "APC does not influence the editorial decision."
      ],
      "image-integrity": [
        "Figures must remain an accurate record of the original data. Cropping, contrast and labelling must not mislead. Splicing, duplication and inappropriate manipulation are not allowed."
      ],
      "language-policy": [
        "The English full text is the version of record unless a specific article states otherwise. Translations must be linked to the same article record and point to the primary text.",
        "Russian, Chinese and Arabic versions may include the title, abstract, keywords, author details, a plain-language summary and the website interface translation."
      ],
      "misconduct": [
        "The journal investigates fabrication and falsification of data, plagiarism, citation manipulation, undisclosed conflicts and other breaches of publication ethics."
      ],
      "negative-results": [
        "Absence of a statistically significant effect is not, by itself, a reason to accept or reject a manuscript."
      ],
      "open-access": [
        "Biological Systems and Methods publishes in an open-access model. After publication, readers have free access to the full text without a subscription.",
        "Submission and peer review are free of charge. The article processing charge (APC) is collected only after acceptance."
      ],
      "plagiarism": [
        "Submitted texts are checked for originality. Inappropriate reuse of text, including uncited self-plagiarism, is not allowed."
      ],
      "preprint": [
        "Authors may post a preprint before or during review. The preprint link must be disclosed at submission and in the article metadata."
      ],
      "privacy": [
        "Account and submission data are used for editorial work and support. They are not sold or transferred to third parties for advertising. Forms do not fake a successful send."
      ],
      "publication-ethics": [
        "The journal follows internationally recognised principles of authorship, originality, research ethics and correction of the published record. Main rules:"
      ],
      "terms": [
        "Site materials, unless an article licence states otherwise, must not be presented as official journal decisions. Authors retain rights to their manuscripts; published articles follow the stated licence."
      ],
    },
    zh: {
      "about": [
        "Biological Systems and Methods 发表生命科学领域的原创研究、方法、综述以及阴性、零结果与意外结果。编辑决定由科学编辑作出。自动化工具仅用于技术与语言支持。"
      ],
      "accessibility": [
        "网站采用语义标记、键盘导航与可见焦点。"
      ],
      "advertising": [
        "若日后引入广告，将与编辑决定分开。赞助不影响稿件评价。"
      ],
      "aims": [
        "本刊汇集实验、计算与方法学研究，并支持发表阳性结果以及方法学上可靠的阴性结果。"
      ],
      "apc": [
        "或",
        "APC 费率与作者学术身份无关。支付能力不纳入稿件的科学评价。",
        "减免政策：",
        "减免政策将在期刊完整的编辑与法律模式确认后公布。"
      ],
      "confidentiality": [
        "稿件与审稿意见保密，不得用于个人或竞争目的。未经编辑许可，不得将材料提供给人工智能系统。"
      ],
      "conflicts": [
        "作者、编辑与审稿人须披露可能影响工作的财务、机构、个人及其他关系。相关利益冲突将随文章公布。"
      ],
      "cookies": [
        "网站可能使用必要的技术性 cookie 以保存语言选择与表单草稿。不使用跟踪 cookie。"
      ],
      "corrections": [
        "必要时期刊发布更正与撤稿。记录包括 version、correctionHistory、retractionStatus、expressionOfConcern 与 publicationHistory。"
      ],
      "duplicate-publication": [
        "同一结果不得重复发表。与既有工作的重叠必须披露并引用，并说明新贡献。"
      ],
      "editorial-independence": [
        "录用与拒稿不取决于支付能力。APC 与商业利益不决定编辑决定。"
      ],
      "editors-guide": [
        "APC 不影响编辑决定。"
      ],
      "image-integrity": [
        "图件必须如实反映原始数据。裁剪、对比度与标注不得误导。不允许拼接、重复使用与不当处理。"
      ],
      "language-policy": [
        "除非某篇文章另有说明，英文全文为正式版本。译文须链接至同一文章记录并指向正文。",
        "俄文、中文与阿拉伯文版本可包含题名、摘要、关键词、作者信息、科普摘要及网站界面译文。"
      ],
      "misconduct": [
        "本刊调查数据伪造与篡改、剽窃、引用操纵、未披露的利益冲突及其他出版伦理违规。"
      ],
      "negative-results": [
        "缺乏统计学显著效应本身不是录用或拒稿的理由。"
      ],
      "open-access": [
        "Biological Systems and Methods 采用开放获取模式。发表后读者可免费阅读全文，无需订阅。",
        "投稿与审稿免费。文章处理费（APC）仅在录用后收取。"
      ],
      "plagiarism": [
        "来稿将检查原创性。不允许不当重复使用文本，包括未注明的自我剽窃。"
      ],
      "preprint": [
        "作者可在审稿前或审稿期间发布预印本。投稿时及文章元数据中须披露预印本链接。"
      ],
      "privacy": [
        "账户与投稿数据用于编辑工作与支持，不出售或转让给第三方用于广告。表单不会伪造提交成功。"
      ],
      "publication-ethics": [
        "本刊遵循国际公认的作者贡献、原创性、研究伦理与更正已发表记录的原则。主要规则："
      ],
      "terms": [
        "除非文章许可另有规定，网站材料不得被表述为期刊的正式决定。作者保留稿件权利；已发表文章遵循所载许可。"
      ],
    },
  };

  window.BSPageI18n = { headers, cards, extras, bodies };
})();
