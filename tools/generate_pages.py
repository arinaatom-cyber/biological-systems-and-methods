# -*- coding: utf-8 -*-
"""Generate journal HTML pages from shared shell + content bodies."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SHELL = """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <link rel="canonical" href="{canonical}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="theme-color" content="#0d2b28" />
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml" />
  <link rel="manifest" href="site.webmanifest" />
  <link rel="alternate" hreflang="ru" href="{canonical}" />
  <link rel="alternate" hreflang="en" href="{canonical}" />
  <link rel="alternate" hreflang="zh" href="{canonical}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/styles.css" />
</head>
<body data-page="{page}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="site-header"></header>
  <main id="main" class="page-main">
    <div class="container narrow-prose">
      <nav class="breadcrumbs" aria-label="Breadcrumb" data-breadcrumbs></nav>
      <header class="page-header">
        <p class="page-kicker">{kicker}</p>
        <h1>{h1}</h1>
        {lede}
      </header>
      {body}
    </div>
  </main>
  <footer class="site-footer" id="site-footer"></footer>
  <script src="assets/js/config.js"></script>
  <script src="assets/js/i18n.js"></script>
  <script src="assets/js/site.js"></script>
  <script src="assets/js/chatbot.js"></script>
  {extra_scripts}
</body>
</html>
"""

PLACEHOLDER = "Информация будет добавлена."


def lede(text: str) -> str:
    return f'<p class="page-lede">{text}</p>' if text else ""


PAGES = []


def add(filename, page, title, description, kicker, h1, lede_text, body, extra=""):
    PAGES.append(
        dict(
            filename=filename,
            page=page,
            title=title,
            description=description,
            kicker=kicker,
            h1=h1,
            lede=lede(lede_text),
            body=body,
            extra_scripts=extra,
        )
    )


# --- About cluster ---
add(
    "about.html",
    "about",
    "О журнале — Biological Systems and Methods",
    "О рецензируемом журнале открытого доступа Biological Systems and Methods.",
    "О журнале",
    "Biological Systems and Methods",
    "Рецензируемый журнал открытого доступа по биологии, биоинформатике, биохимии и биофизике.",
    """
    <section class="prose-block">
      <p>Biological Systems and Methods публикует оригинальные исследования, методы, обзоры, отрицательные, нулевые и неожиданные результаты в области наук о жизни. Редакционные решения принимаются научными редакторами. Автоматизированные инструменты используются только для технической и языковой поддержки.</p>
      <ul class="link-list">
        <li><a href="aims.html">Цели и тематика</a></li>
        <li><a href="editorial.html">Редакционная коллегия</a></li>
        <li><a href="publisher.html">Издатель</a></li>
        <li><a href="open-access.html">Модель открытого доступа</a></li>
        <li><a href="history.html">История журнала</a></li>
        <li><a href="news.html">Новости</a></li>
        <li><a href="contact.html">Контакты</a></li>
      </ul>
    </section>
    """,
)

add(
    "aims.html",
    "aims",
    "Цели и тематика — Biological Systems and Methods",
    "Aims and scope журнала Biological Systems and Methods.",
    "О журнале",
    "Цели и тематика",
    "Biological Systems and Methods публикует исследования, направленные на получение воспроизводимых и интерпретируемых результатов в науках о жизни.",
    """
    <section class="prose-block">
      <p>Журнал объединяет экспериментальные, вычислительные и методологические работы и поддерживает публикацию как положительных, так и методологически обоснованных отрицательных результатов.</p>
      <div class="scope-grid" id="aims-scope"></div>
    </section>
    """,
    '<script src="assets/js/pages/aims.js"></script>',
)

add(
    "publisher.html",
    "publisher",
    "Издатель — Biological Systems and Methods",
    "Сведения об издателе и юридическом лице Biological Systems and Methods.",
    "О журнале",
    "Издатель",
    "Юридические и издательские сведения заполняются после регистрации организации.",
    f"""
    <section class="prose-block dl-panel" id="publisher-panel" data-publisher-panel>
      <dl>
        <dt>Издатель</dt><dd data-cfg="publisherName">{PLACEHOLDER}</dd>
        <dt>Юридическое лицо</dt><dd data-cfg="legalEntityName">{PLACEHOLDER}</dd>
        <dt>Страна регистрации</dt><dd data-cfg="registrationCountry">{PLACEHOLDER}</dd>
        <dt>Юридический адрес</dt><dd data-cfg="legalAddress">{PLACEHOLDER}</dd>
        <dt>Почтовый адрес</dt><dd data-cfg="postalAddress">{PLACEHOLDER}</dd>
        <dt>Регистрационные сведения</dt><dd data-cfg="registrationDetails">{PLACEHOLDER}</dd>
        <dt>Ответственный издатель</dt><dd data-cfg="responsiblePublisher">{PLACEHOLDER}</dd>
      </dl>
      <p class="form-note">Контакт координатора: <a href="mailto:arina.atom@gmail.com" data-cfg-email>arina.atom@gmail.com</a></p>
    </section>
    """,
)

add(
    "open-access.html",
    "open-access",
    "Модель открытого доступа — Biological Systems and Methods",
    "Open Access и лицензия CC BY 4.0 журнала Biological Systems and Methods.",
    "О журнале",
    "Модель открытого доступа",
    "Планируемая лицензия публикации: CC BY 4.0.",
    """
    <section class="prose-block">
      <p>Biological Systems and Methods публикует материалы в модели открытого доступа. После публикации статьи читатели получают свободный доступ к полному тексту без подписки.</p>
      <p>Планируемая лицензия для опубликованных статей — <strong>CC BY 4.0</strong>. Пока статьи не опубликованы, лицензия описывает будущую модель, а не уже выпущенный контент.</p>
      <p>Подача и рецензирование бесплатны. Статья Processing Charge (APC) взимается только после принятия рукописи.</p>
      <p><a class="btn btn-ghost" href="apc.html">Стоимость публикации</a></p>
    </section>
    """,
)

add(
    "history.html",
    "history",
    "История журнала — Biological Systems and Methods",
    "История журнала Biological Systems and Methods.",
    "О журнале",
    "История журнала",
    "",
    """
    <section class="empty-state">
      <h2>История журнала</h2>
      <p>Хронология и ключевые этапы развития редакции будут опубликованы в этом разделе.</p>
    </section>
    """,
)

add(
    "news.html",
    "news",
    "Новости — Biological Systems and Methods",
    "Новости редакции Biological Systems and Methods.",
    "О журнале",
    "Новости",
    "",
    """
    <section class="empty-state">
      <h2>Новости редакции</h2>
      <p>Новости редакции будут опубликованы в этом разделе.</p>
    </section>
    """,
)

add(
    "contact.html",
    "contact",
    "Контакты — Biological Systems and Methods",
    "Контакты редакционного офиса Biological Systems and Methods.",
    "Контакты",
    "Контакты",
    "Редакционный офис",
    """
    <section class="prose-block contact-grid" id="contact-panel">
      <article class="policy-card">
        <h2>Email координатора</h2>
        <p><a href="mailto:arina.atom@gmail.com" data-cfg-email>arina.atom@gmail.com</a></p>
      </article>
      <article class="policy-card">
        <h2>Техническая поддержка</h2>
        <p data-contact-role="support">пока тот же контакт</p>
      </article>
      <article class="policy-card">
        <h2>Вопросы о рукописях</h2>
        <p data-contact-role="submissions">пока тот же контакт</p>
      </article>
      <article class="policy-card">
        <h2>Этика и жалобы</h2>
        <p data-contact-role="ethics">пока тот же контакт</p>
      </article>
    </section>
    """,
)

# --- Authors ---
add(
    "authors.html",
    "authors",
    "Авторам — Biological Systems and Methods",
    "Инструкции и ресурсы для авторов Biological Systems and Methods.",
    "Авторам",
    "Авторам",
    "Подача и рецензирование бесплатны. APC взимается только после принятия статьи.",
    """
    <section class="card-link-grid">
      <a class="policy-card" href="authors-guidelines.html"><h2>Инструкции авторам</h2><p>Структура рукописи и требования к материалам.</p></a>
      <a class="policy-card" href="article-types.html"><h2>Типы рукописей</h2><p>Исследования, методы, обзоры, Negative Results и др.</p></a>
      <a class="policy-card" href="authors-files.html"><h2>Подготовка файлов</h2><p>Форматы изображений, таблиц и приложений.</p></a>
      <a class="policy-card" href="process.html"><h2>Процесс публикации</h2><p>14 шагов от подачи до публикации.</p></a>
      <a class="policy-card" href="apc.html"><h2>APC</h2><p>Стоимость после принятия рукописи.</p></a>
      <a class="policy-card" href="apc.html#waiver"><h2>Освобождение от APC</h2><p>Будущая политика полного и частичного освобождения.</p></a>
      <a class="policy-card" href="publication-ethics.html"><h2>Публикационная этика</h2><p>Авторство, оригинальность, этика исследований.</p></a>
      <a class="policy-card" href="submit.html"><h2>Подать рукопись</h2><p>Форма подачи рукописи.</p></a>
    </section>
    """,
)

add(
    "authors-guidelines.html",
    "authors-guidelines",
    "Инструкции авторам — Biological Systems and Methods",
    "Требования к рукописям Biological Systems and Methods.",
    "Авторам",
    "Инструкции авторам",
    "Ниже перечислены обязательные разделы рукописи и общие требования к представлению данных.",
    """
    <p class="cta-row">
      <a class="btn btn-primary" href="templates/Biological-Sciences-manuscript-template.docx" download>Скачать шаблон статьи (DOCX)</a>
      <a class="btn btn-ghost" href="submit.html">Подать рукопись</a>
    </p>
    <p class="form-note">Шаблон в духе издательского макета: название журнала сверху, далее текст без широкого левого поля и без красной строки.</p>
    <section class="prose-block">
      <h2>Обязательные разделы рукописи</h2>
      <ul class="checklist">
        <li>название;</li>
        <li>авторы и аффилиации;</li>
        <li>ORCID;</li>
        <li>автор для корреспонденции;</li>
        <li>аннотация;</li>
        <li>ключевые слова;</li>
        <li>введение;</li>
        <li>материалы и методы;</li>
        <li>результаты;</li>
        <li>обсуждение;</li>
        <li>выводы;</li>
        <li>вклад авторов по CRediT;</li>
        <li>финансирование;</li>
        <li>одобрение этического комитета;</li>
        <li>информированное согласие;</li>
        <li>доступность данных;</li>
        <li>доступность кода;</li>
        <li>конфликты интересов;</li>
        <li>благодарности;</li>
        <li>список литературы.</li>
      </ul>
      <h2>Дополнительные требования</h2>
      <ul class="checklist">
        <li>изображения должны быть читаемыми;</li>
        <li>таблицы должны предоставляться в редактируемом формате;</li>
        <li>статистические методы должны быть описаны воспроизводимо;</li>
        <li>биологические и технические репликаты должны быть чётко различены;</li>
        <li>исключённые наблюдения должны быть обоснованы;</li>
        <li>программное обеспечение должно сопровождаться версиями;</li>
        <li>идентификаторы наборов данных должны быть указаны;</li>
        <li>для омиксных исследований нужны ссылки на профильные репозитории;</li>
        <li>для вычислительных исследований необходимы код, зависимости и инструкции запуска;</li>
        <li>использование генеративного ИИ должно быть раскрыто.</li>
      </ul>
      <p><a class="btn btn-primary" href="submit.html">Подать рукопись</a>
      <a class="btn btn-ghost" href="article-types.html">Типы статей</a></p>
    </section>
    """,
)

add(
    "authors-files.html",
    "authors-files",
    "Подготовка файлов — Biological Systems and Methods",
    "Требования к файлам рукописи Biological Systems and Methods.",
    "Авторам",
    "Подготовка файлов",
    "",
    """
    <section class="prose-block">
      <ul class="checklist">
        <li>Основной текст: DOCX или LaTeX (PDF + исходники).</li>
        <li>Рисунки: TIFF/PNG/SVG, достаточное разрешение для печати и экрана.</li>
        <li>Таблицы: редактируемый формат (DOCX/XLSX), не только изображения.</li>
        <li>Приложения и supplementary files — отдельными файлами с понятными именами.</li>
        <li>Данные и код — ссылки на репозитории или архивы в составе подачи.</li>
      </ul>
      <p><a href="data-policy.html">Политика данных и кода</a></p>
    </section>
    """,
)

add(
    "article-types.html",
    "article-types",
    "Типы публикаций — Biological Systems and Methods",
    "Типы статей, принимаемых журналом Biological Systems and Methods.",
    "Авторам",
    "Типы публикаций",
    "Для каждого типа указаны назначение, структура, данные, код и формат рецензирования. Жёсткие лимиты слов не задаются без утверждённой редакционной политики.",
    """
    <section id="article-types-root" class="types-grid"></section>
    """,
    '<script src="assets/js/pages/article-types.js"></script>',
)

add(
    "apc.html",
    "apc",
    "Стоимость публикации (APC) — Biological Systems and Methods",
    "APC журнала Biological Systems and Methods: 75 000 RUB или 6 000 CNY после принятия.",
    "Авторам",
    "Стоимость публикации",
    "Подача рукописи и её рецензирование бесплатны. Сбор за обработку статьи взимается только после принятия рукописи к публикации.",
    """
    <section class="prose-block">
      <div class="apc-panel">
        <p class="apc-figure"><strong data-apc="RUB">75 000 RUB</strong></p>
        <p>или</p>
        <p class="apc-figure"><strong data-apc="CNY">6 000 CNY</strong></p>
      </div>
      <ul class="checklist">
        <li>APC не оплачивается при подаче;</li>
        <li>APC не влияет на редакционное решение;</li>
        <li>счёт выставляется только после принятия;</li>
        <li>стоимость включает редакционную обработку, техническую подготовку, публикацию и поддержку открытого доступа;</li>
        <li>налоги и банковские комиссии указываются в счёте;</li>
        <li>окончательные платёжные реквизиты добавляются после регистрации юридического лица.</li>
      </ul>
      <h2 id="waiver">Освобождение от APC</h2>
      <p>Единый APC применяется независимо от академического статуса автора. Политика полного и частичного освобождения от оплаты будет опубликована отдельно.</p>
      <p>Планируемая структура:</p>
      <ul>
        <li>полное освобождение;</li>
        <li>частичное освобождение;</li>
        <li>институциональное соглашение;</li>
        <li>редакционно приглашённый материал;</li>
        <li>документально подтверждённое отсутствие финансирования.</li>
      </ul>
      <p class="form-note">Заявки на освобождение от оплаты начнут рассматриваться после утверждения соответствующей политики.</p>
    </section>
    """,
)

add(
    "data-policy.html",
    "data-policy",
    "Политика данных и кода — Biological Systems and Methods",
    "Требования к данным и коду в Biological Systems and Methods.",
    "Авторам",
    "Политика данных и кода",
    "Данные, код и аналитические материалы должны быть доступны в объёме, достаточном для проверки и воспроизведения основных результатов статьи, кроме случаев, когда доступ ограничен требованиями конфиденциальности, биоэтики или законодательства.",
    """
    <section class="prose-block">
      <h2>Категории заявлений о данных</h2>
      <ul class="checklist">
        <li>данные доступны в открытом репозитории;</li>
        <li>данные доступны по обоснованному запросу;</li>
        <li>данные имеют контролируемый доступ;</li>
        <li>новые данные не создавались;</li>
        <li>данные включены в статью и приложения;</li>
        <li>ограничения доступа описаны отдельно.</li>
      </ul>
      <h2>Требования к коду</h2>
      <ul class="checklist">
        <li>постоянная ссылка;</li>
        <li>версия или релиз;</li>
        <li>лицензия;</li>
        <li>файл зависимостей;</li>
        <li>README;</li>
        <li>минимальный пример запуска;</li>
        <li>входные и выходные форматы;</li>
        <li>фиксация версии, использованной в статье.</li>
      </ul>
    </section>
    """,
)

add(
    "negative-results.html",
    "negative-results",
    "Negative Results — Biological Systems and Methods",
    "Политика публикации отрицательных и нулевых результатов.",
    "Материалы",
    "Отрицательные результаты — с тем же стандартом научной оценки",
    "Biological Systems and Methods рассматривает отрицательные, нулевые и неожиданные результаты на основании качества исследовательского дизайна, корректности статистического анализа, воспроизводимости и научной значимости поставленного вопроса.",
    """
    <section class="prose-block">
      <p>Само по себе отсутствие статистической значимости не является достаточным основанием для публикации.</p>
      <h2>Критерии</h2>
      <ul class="checklist">
        <li>заранее сформулированная исследовательская гипотеза;</li>
        <li>обоснованный размер выборки;</li>
        <li>оценка статистической мощности;</li>
        <li>доверительные интервалы и размер эффекта;</li>
        <li>корректное различение отсутствия доказательств и доказательства отсутствия эффекта;</li>
        <li>описание всех исключений и отклонений от протокола;</li>
        <li>доступность данных и кода;</li>
        <li>обсуждение ограничений;</li>
        <li>соответствие профильным руководствам по отчётности.</li>
      </ul>
      <p><a class="btn btn-primary" href="article-types.html#negative-results">Требования к Negative Results</a></p>
    </section>
    """,
)

# --- Editors / reviewers ---
add(
    "editors.html",
    "editors",
    "Редакторам — Biological Systems and Methods",
    "Руководства и ресурсы для редакторов Biological Systems and Methods.",
    "Редакторам и рецензентам",
    "Редакторам",
    "",
    """
    <section class="card-link-grid">
      <a class="policy-card" href="editors-guide.html"><h2>Руководство для редакторов</h2><p>Этапы оценки и принятия решений.</p></a>
      <a class="policy-card" href="join.html"><h2>Стать редактором или рецензентом</h2><p>Заявка в редакционную коллегию или пул рецензентов.</p></a>
      <a class="policy-card" href="confidentiality.html"><h2>Конфиденциальность</h2><p>Обращение с неопубликованными материалами.</p></a>
      <a class="policy-card" href="ai-policy.html"><h2>Использование ИИ</h2><p>Ограничения для редакции и рецензентов.</p></a>
      <a class="policy-card" href="conflicts.html"><h2>Конфликты интересов</h2><p>Декларация и управление COI.</p></a>
    </section>
    """,
)

add(
    "reviewers.html",
    "reviewers",
    "Рецензентам — Biological Systems and Methods",
    "Руководства для рецензентов Biological Systems and Methods.",
    "Редакторам и рецензентам",
    "Рецензентам",
    "",
    """
    <section class="card-link-grid">
      <a class="policy-card" href="reviewers-guide.html"><h2>Руководство для рецензентов</h2><p>Критерии и этика рецензирования.</p></a>
      <a class="policy-card" href="peer-review.html"><h2>Peer Review Policy</h2><p>Этапы и возможные решения.</p></a>
      <a class="policy-card" href="join.html"><h2>Стать редактором или рецензентом</h2><p>Заявка в пул рецензентов.</p></a>
    </section>
    """,
)

add(
    "editors-guide.html",
    "editors-guide",
    "Руководство для редакторов — Biological Systems and Methods",
    "Руководство научного редактора Biological Systems and Methods.",
    "Редакторам",
    "Руководство для редакторов",
    "Ответственный редактор оценивает соответствие тематике, качество дизайна и полноту деклараций, подбирает рецензентов и принимает окончательное решение.",
    """
    <section class="prose-block">
      <ol class="steps-list">
        <li>Проверить комплектность и этические декларации.</li>
        <li>Оценить научную значимость и методологическую корректность.</li>
        <li>Назначить независимых рецензентов без конфликта интересов.</li>
        <li>Синтезировать заключения и вынести решение.</li>
        <li>Проверить исправления авторов перед финальным принятием.</li>
      </ol>
      <p>APC не влияет на редакционное решение.</p>
    </section>
    """,
)

add(
    "reviewers-guide.html",
    "reviewers-guide",
    "Руководство для рецензентов — Biological Systems and Methods",
    "Руководство рецензента Biological Systems and Methods.",
    "Рецензентам",
    "Руководство для рецензентов",
    "Рецензент оценивает дизайн, статистику, воспроизводимость, интерпретацию и соответствие заявленному типу статьи.",
    """
    <section class="prose-block">
      <ul class="checklist">
        <li>раскрыть конфликт интересов до начала работы;</li>
        <li>не загружать неопубликованную рукопись в публичные генеративные ИИ-сервисы;</li>
        <li>сохранять конфиденциальность;</li>
        <li>отделять методологическую критику от предпочтений к «положительным» результатам;</li>
        <li>для Negative Results оценивать мощность, размер эффекта и корректность выводов.</li>
      </ul>
    </section>
    """,
)

add(
    "editorial.html",
    "editorial",
    "Редакционная коллегия — Biological Systems and Methods",
    "Состав редакционной коллегии Biological Systems and Methods формируется.",
    "О журнале",
    "Редакционная коллегия",
    "Редакционная коллегия формируется по направлениям Biology, Bioinformatics, Biochemistry, Biophysics, Reproducibility and Methodology.",
    """
    <section class="stats-strip board-stats" id="board-stats"></section>
    <section class="empty-state">
      <p>Состав редакционной коллегии формируется.</p>
      <p>Карточки редакторов появятся после подтверждения состава. Вымышленные профили не публикуются.</p>
      <div id="editors-list" class="editors-grid" hidden></div>
      <p><a class="btn btn-primary" href="join.html">Стать редактором или рецензентом</a></p>
    </section>
    <section class="prose-block">
      <h2>Требования к кандидатам</h2>
      <ul class="checklist">
        <li>профильное научное образование;</li>
        <li>активная публикационная деятельность;</li>
        <li>опыт рецензирования;</li>
        <li>отсутствие подтверждённых нарушений публикационной этики;</li>
        <li>готовность соблюдать конфиденциальность;</li>
        <li>декларация конфликтов интересов;</li>
        <li>подтверждённая аффилиация;</li>
        <li>ORCID.</li>
      </ul>
    </section>
    """,
    '<script src="assets/js/pages/editorial.js"></script>',
)

# --- Policies ---
add(
    "policies.html",
    "policies",
    "Правила — Biological Systems and Methods",
    "Редакционные правила и этика Biological Systems and Methods.",
    "Правила",
    "Правила журнала",
    "Редакционные процедуры разработаны с учётом международно признанных принципов публикационной этики.",
    """
    <section class="card-link-grid">
      <a class="policy-card" href="authors-guidelines.html"><h2>Инструкции авторам</h2><p>Структура рукописи и требования к материалам.</p></a>
      <a class="policy-card" href="article-types.html"><h2>Типы рукописей</h2><p>Исследования, методы, обзоры, отрицательные результаты и др.</p></a>
      <a class="policy-card" href="editors-guide.html"><h2>Правила для редакторов</h2><p>Роли, решения и этика редактирования.</p></a>
      <a class="policy-card" href="reviewers-guide.html"><h2>Правила для рецензентов</h2><p>Критерии оценки и конфиденциальность.</p></a>
      <a class="policy-card" href="peer-review.html"><h2>Рецензирование</h2><p>Этапы и решения рецензирования.</p></a>
      <a class="policy-card" href="publication-ethics.html"><h2>Публикационная этика</h2><p>Общие принципы этики публикаций.</p></a>
      <a class="policy-card" href="authorship.html"><h2>Авторство</h2><p>Критерии авторства и CRediT.</p></a>
      <a class="policy-card" href="conflicts.html"><h2>Конфликты интересов</h2><p>Декларация конфликтов.</p></a>
      <a class="policy-card" href="research-ethics.html"><h2>Этика исследований</h2><p>Требования к этике исследований.</p></a>
      <a class="policy-card" href="corrections.html"><h2>Исправления и отзывы</h2><p>Исправления, выражения обеспокоенности и отзывы.</p></a>
      <a class="policy-card" href="complaints.html"><h2>Жалобы и апелляции</h2><p>Порядок подачи жалоб и апелляций.</p></a>
      <a class="policy-card" href="misconduct.html"><h2>Нарушения</h2><p>Расследование нарушений публикационной этики.</p></a>
      <a class="policy-card" href="image-integrity.html"><h2>Целостность изображений</h2><p>Требования к рисункам и правкам.</p></a>
      <a class="policy-card" href="duplicate-publication.html"><h2>Повторные публикации</h2><p>Дублирование и пересечение рукописей.</p></a>
      <a class="policy-card" href="plagiarism.html"><h2>Плагиат и переработка текста</h2><p>Проверка оригинальности и самоцитирование.</p></a>
      <a class="policy-card" href="preprint.html"><h2>Препринты</h2><p>Правила размещения препринтов.</p></a>
      <a class="policy-card" href="confidentiality.html"><h2>Конфиденциальность</h2><p>Конфиденциальность рукописей и рецензий.</p></a>
      <a class="policy-card" href="advertising.html"><h2>Реклама и спонсорство</h2><p>Разграничение редакции и рекламы.</p></a>
      <a class="policy-card" href="editorial-independence.html"><h2>Редакционная независимость</h2><p>Независимость редакционных решений.</p></a>
      <a class="policy-card" href="ai-policy.html"><h2>Использование ИИ</h2><p>Правила использования генеративных инструментов.</p></a>
      <a class="policy-card" href="language-policy.html"><h2>Языковые правила</h2><p>Язык записи и переводы.</p></a>
      <a class="policy-card" href="data-policy.html"><h2>Данные и код</h2><p>Доступность материалов исследования.</p></a>
    </section>
    """,
)

POLICY_PAGES = [
    (
        "peer-review.html",
        "peer-review",
        "Peer Review Policy",
        "Политика рецензирования Biological Systems and Methods.",
        "Biological Systems and Methods использует редакционную предварительную оценку и независимое научное рецензирование.",
        """
        <ol class="steps-list">
          <li>Проверка комплектности файлов.</li>
          <li>Проверка соответствия тематике.</li>
          <li>Проверка обязательных этических деклараций.</li>
          <li>Первичная оценка научным редактором.</li>
          <li>Подбор независимых рецензентов.</li>
          <li>Получение заключений.</li>
          <li>Решение о доработке, принятии или отклонении.</li>
          <li>Проверка исправлений.</li>
          <li>Финальное редакционное решение.</li>
          <li>Техническая подготовка публикации.</li>
        </ol>
        <h2>Возможные решения</h2>
        <ul><li>Accept</li><li>Minor Revision</li><li>Major Revision</li><li>Reject and Resubmit</li><li>Reject</li></ul>
        <h2>Правила</h2>
        <ul class="checklist">
          <li>не менее двух независимых экспертных заключений для исследовательской статьи, если редактор не обоснует иной порядок;</li>
          <li>рецензент обязан раскрыть конфликт интересов;</li>
          <li>рецензент не должен загружать неопубликованную рукопись в публичные генеративные ИИ-сервисы;</li>
          <li>окончательное решение принимает ответственный редактор;</li>
          <li>APC не влияет на редакционное решение;</li>
          <li>автор может подать мотивированную апелляцию.</li>
        </ul>
        """,
    ),
    (
        "publication-ethics.html",
        "publication-ethics",
        "Publication Ethics",
        "Публикационная этика Biological Systems and Methods.",
        "Редакционные процедуры разработаны с учётом международно признанных принципов публикационной этики.",
        """
        <p>Журнал ожидает от авторов, редакторов и рецензентов честности, прозрачности и уважения к правам участников исследований. Подробные разделы:</p>
        <ul class="link-list">
          <li><a href="authorship.html">Authorship</a></li>
          <li><a href="conflicts.html">Conflicts of Interest</a></li>
          <li><a href="research-ethics.html">Research Ethics</a></li>
          <li><a href="misconduct.html">Misconduct</a></li>
          <li><a href="plagiarism.html">Plagiarism and Text Recycling</a></li>
          <li><a href="corrections.html">Corrections and Retractions</a></li>
        </ul>
        """,
    ),
    (
        "authorship.html",
        "authorship",
        "Authorship",
        "Критерии авторства Biological Systems and Methods.",
        "Авторство определяется существенным вкладом в исследование и ответственностью за содержание работы.",
        """
        <ul class="checklist">
          <li>все авторы соответствуют критериям существенного вклада;</li>
          <li>вклад описывается по таксономии CRediT;</li>
          <li>автор для корреспонденции обеспечивает коммуникацию с редакцией;</li>
          <li>изменение состава авторов после подачи требует согласия всех авторов и объяснения;</li>
          <li>ИИ не может быть указан как автор.</li>
        </ul>
        """,
    ),
    (
        "conflicts.html",
        "conflicts",
        "Conflicts of Interest",
        "Политика конфликтов интересов Biological Systems and Methods.",
        "Все потенциальные конфликты интересов должны быть раскрыты.",
        """
        <p>Авторы, редакторы и рецензенты декларируют финансовые, институциональные, персональные и иные отношения, которые могут повлиять на оценку рукописи. При конфликте редактор или рецензент отстраняется от работы с материалом.</p>
        """,
    ),
    (
        "research-ethics.html",
        "research-ethics",
        "Research Ethics",
        "Этика исследований Biological Systems and Methods.",
        "Исследования с участием людей или животных должны сопровождаться необходимыми одобрениями.",
        """
        <ul class="checklist">
          <li>одобрение этического комитета при необходимости;</li>
          <li>информированное согласие участников;</li>
          <li>соблюдение норм работы с биологическими материалами;</li>
          <li>прозрачное описание ограничений и рисков.</li>
        </ul>
        """,
    ),
    (
        "corrections.html",
        "corrections",
        "Corrections and Retractions",
        "Исправления и отзывы статей Biological Systems and Methods.",
        "Журнал поддерживает целостность научной записи после публикации.",
        """
        <ul>
          <li>Correction</li>
          <li>Author Correction</li>
          <li>Publisher Correction</li>
          <li>Retraction</li>
          <li>Expression of Concern</li>
          <li>Removal in exceptional circumstances</li>
        </ul>
        <p>Каждая новая версия связывается с исходной статьёй. В структуре статьи предусмотрены поля: version, correctionHistory, retractionStatus, expressionOfConcern, publicationHistory.</p>
        """,
    ),
    (
        "complaints.html",
        "complaints",
        "Complaints and Appeals",
        "Жалобы и апелляции Biological Systems and Methods.",
        "Авторы могут подать мотивированную апелляцию на редакционное решение.",
        """
        <p>Жалобы по этике и апелляции направляются на контакт этики (см. <a href="contact.html">Контакты</a>). Обращения рассматриваются ответственным редактором или координатором, не участвовавшим в исходном решении, когда это необходимо.</p>
        """,
    ),
    (
        "misconduct.html",
        "misconduct",
        "Misconduct",
        "Политика в отношении нарушений Biological Systems and Methods.",
        "Подозрения в нарушении публикационной этики рассматриваются по установленной процедуре.",
        """
        <p>К нарушениям относятся фабрикация и фальсификация данных, плагиат, манипуляции с изображениями, недобросовестное авторство и сокрытие существенных конфликтов интересов. При подтверждении нарушения возможны отклонение, исправление, отзыв статьи и уведомление учреждения.</p>
        """,
    ),
    (
        "image-integrity.html",
        "image-integrity",
        "Image Integrity",
        "Целостность изображений Biological Systems and Methods.",
        "Обработка изображений не должна искажать исходные данные.",
        """
        <p>Допустимы минимальные корректировки яркости/контраста, применяемые ко всему изображению и описанные в методах. Недопустимы выборочное усиление, клонирование, сокрытие и необоснованная сборка панелей.</p>
        """,
    ),
    (
        "duplicate-publication.html",
        "duplicate-publication",
        "Duplicate Publication",
        "Политика повторных публикаций Biological Systems and Methods.",
        "Рукопись должна быть оригинальной и не рассматриваться параллельно в другом издании.",
        """
        <p>Предыдущие публикации (включая препринты) должны быть раскрыты. Переводы и вторичные публикации допускаются только при прозрачной связи с исходной записью и согласии правообладателей.</p>
        """,
    ),
    (
        "plagiarism.html",
        "plagiarism",
        "Plagiarism and Text Recycling",
        "Плагиат и переработка текста Biological Systems and Methods.",
        "Плагиат и недобросовестный text recycling недопустимы.",
        """
        <p>Заимствования должны быть корректно процитированы. Существенное повторное использование собственного текста без указания источника может рассматриваться как нарушение.</p>
        """,
    ),
    (
        "preprint.html",
        "preprint",
        "Preprint Policy",
        "Политика препринтов Biological Systems and Methods.",
        "Препринты допускаются при раскрытии ссылки.",
        """
        <p>Авторы могут размещать рукопись на препринт-сервере до или во время рассмотрения. Ссылка на препринт указывается при подаче и связывается со статьёй после публикации.</p>
        """,
    ),
    (
        "confidentiality.html",
        "confidentiality",
        "Confidentiality",
        "Конфиденциальность Biological Systems and Methods.",
        "Неопубликованные рукописи являются конфиденциальными.",
        """
        <p>Редакторы и рецензенты не передают рукописи третьим лицам и не используют их содержание в собственных интересах. Загрузка в открытые ИИ-сервисы без гарантий конфиденциальности запрещена.</p>
        """,
    ),
    (
        "advertising.html",
        "advertising",
        "Advertising and Sponsorship",
        "Реклама и спонсорство Biological Systems and Methods.",
        "Редакционные решения независимы от рекламы и спонсорства.",
        """
        <p>Любые будущие партнёрские материалы будут явно отделены от редакционного контента. Спонсорство не влияет на принятие или отклонение рукописей.</p>
        """,
    ),
    (
        "editorial-independence.html",
        "editorial-independence",
        "Editorial Independence",
        "Редакционная независимость Biological Systems and Methods.",
        "Научные решения принимает редакция.",
        """
        <p>Издатель и спонсоры не вмешиваются в оценку рукописей. APC и коммерческие отношения не определяют исход рецензирования.</p>
        """,
    ),
    (
        "ai-policy.html",
        "ai-policy",
        "Политика использования ИИ",
        "Политика использования ИИ в Biological Systems and Methods.",
        "Автоматизированные инструменты могут применяться редакцией для проверки комплектности, формата, ссылок, языка и технических параметров файлов. Они не принимают решения о принятии или отклонении рукописи.",
        """
        <ul class="checklist">
          <li>редакционные решения принимаются людьми;</li>
          <li>ИИ не может быть автором;</li>
          <li>авторы несут ответственность за весь текст, изображения, данные и ссылки;</li>
          <li>существенное использование генеративного ИИ должно быть раскрыто;</li>
          <li>конфиденциальные рукописи нельзя передавать в открытые ИИ-сервисы;</li>
          <li>рецензенты не должны загружать рукописи в системы без гарантий конфиденциальности;</li>
          <li>автоматически предложенные исправления проверяются человеком;</li>
          <li>данные рукописей не используются для обучения публичных моделей без отдельного законного основания и информирования;</li>
          <li>ИИ не используется как единственный инструмент проверки научной достоверности.</li>
        </ul>
        """,
    ),
    (
        "language-policy.html",
        "language-policy",
        "Языковая политика",
        "Языковая политика Biological Systems and Methods.",
        "Основной язык version of record — English.",
        """
        <p>Английская версия полного текста является основной версией научной публикации, если для конкретной статьи не указано иное. Переводы должны быть связаны с той же записью статьи и содержать указание на основной текст.</p>
        <p>Русская и китайская версии могут содержать название, аннотацию, ключевые слова, сведения об авторах, научно-популярное резюме и перевод интерфейса.</p>
        """,
    ),
]

for fn, page, h1, desc, lede_t, body in POLICY_PAGES:
    add(
        fn,
        page,
        f"{h1} — Biological Systems and Methods",
        desc,
        "Правила",
        h1,
        lede_t,
        f'<section class="prose-block">{body}</section>',
    )

add(
    "process.html",
    "process",
    "Процесс публикации — Biological Systems and Methods",
    "14 шагов публикации в Biological Systems and Methods.",
    "Авторам",
    "Процесс публикации",
    "От создания учётной записи до публикации и подготовки метаданных.",
    """
    <ol class="steps-list publication-steps" id="publication-steps"></ol>
    """,
    '<script src="assets/js/pages/process.js"></script>',
)

add(
    "privacy.html",
    "privacy",
    "Privacy Policy — Biological Systems and Methods",
    "Политика конфиденциальности Biological Systems and Methods.",
    "Правовая информация",
    "Privacy Policy",
    "Мы обрабатываем персональные данные только в объёме, необходимом для редакционной работы и поддержки сайта.",
    """
    <section class="prose-block">
      <p>Данные форм подачи и заявок используются для рассмотрения рукописей и обращений. Рукописи не размещаются в публичных каталогах сайта до публикации. Запросы об удалении черновиков и персональных данных направляйте на email координатора.</p>
    </section>
    """,
)

add(
    "terms.html",
    "terms",
    "Terms of Use — Biological Systems and Methods",
    "Условия использования сайта Biological Systems and Methods.",
    "Правовая информация",
    "Terms of Use",
    "",
    """
    <section class="prose-block">
      <p>Используя сайт, вы соглашаетесь соблюдать редакционные политики и не загружать вредоносные или незаконные материалы. Контент политик и интерфейса может обновляться; актуальная версия публикуется на соответствующих страницах.</p>
    </section>
    """,
)

add(
    "cookies.html",
    "cookies",
    "Cookie Policy — Biological Systems and Methods",
    "Политика cookie Biological Systems and Methods.",
    "Правовая информация",
    "Cookie Policy",
    "",
    """
    <section class="prose-block">
      <p>Сайт может использовать локальное хранилище браузера для языка интерфейса и черновиков форм. Сторонние рекламные трекеры не используются.</p>
    </section>
    """,
)

add(
    "accessibility.html",
    "accessibility",
    "Accessibility — Biological Systems and Methods",
    "Доступность сайта Biological Systems and Methods.",
    "Правовая информация",
    "Accessibility",
    "Мы стремимся к соответствию базовым практикам доступности: семантическая разметка, клавиатурная навигация, видимый focus и достаточный контраст.",
    """
    <section class="prose-block">
      <p>Если страница недоступна, напишите координатору — мы исправим проблему.</p>
    </section>
    """,
)

add(
    "conferences.html",
    "conferences",
    "Конференции — Biological Systems and Methods",
    "Мероприятия Biological Systems and Methods.",
    "Конференции",
    "Конференции",
    "",
    """
    <section class="empty-state" id="conference-empty">
      <h2>Конференции</h2>
      <p>Новые мероприятия пока не объявлены.</p>
    </section>
    <div id="conference-list" hidden></div>
    """,
    '<script src="assets/js/issues.js"></script>',
)


def main():
    for p in PAGES:
        html = SHELL.format(**p)
        path = ROOT / p["filename"]
        path.write_text(html, encoding="utf-8")
        print("wrote", path.name)
    print(f"done: {len(PAGES)} pages")


if __name__ == "__main__":
    main()
