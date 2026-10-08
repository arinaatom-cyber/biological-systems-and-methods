(() => {
  const CFG = window.BS_CONFIG || {};
  const PAGE = document.body?.dataset?.page || "";
  const NAME = CFG.journalName || "Biomedical Chemistry";
  const NAME_RU = CFG.journalNameRU || CFG.journalNameRu || "Биомедицинская химия";
  const ACRONYM = CFG.journalNameShort || CFG.journalAcronym || "БМХ";
  window.BS = window.BS || {};
  window.BS.NAME = NAME;
  const ASSET_V = "m28";
  const t = (key) => window.BSi18n?.t(key) || key;

  function contactEmail() {
    return (
      CFG.emails?.coordinator ||
      CFG.temporaryEmail ||
      CFG.officialEmail ||
      "arina.atom@gmail.com"
    );
  }

  function formatIssn() {
    return CFG.issn ? String(CFG.issn) : "—";
  }

  function formatEissn() {
    return CFG.eissn ? String(CFG.eissn) : "—";
  }

  function formatApc(currency = CFG.apc?.defaultCurrency || "RUB") {
    const meta = CFG.apc?.currencies?.[currency] || {
      amount: currency === "CNY" ? CFG.apcCNY : CFG.apcRUB,
      symbol: currency === "CNY" ? "¥" : "₽",
      code: currency,
    };
    const amount = meta.amount ?? (currency === "CNY" ? CFG.apcCNY : CFG.apcRUB);
    const uiLang = window.BSi18n?.getLanguage?.() || "ru";
    if (Number(amount) === 0) {
      const free = { ru: "Бесплатно", en: "Free", zh: "免费", ar: "مجاني" };
      return free[uiLang] || "Free";
    }
    const loc = { ru: "ru-RU", zh: "zh-CN", ar: "ar", en: "en-GB" };
    const formatted = Number(amount).toLocaleString(loc[uiLang] || "en-GB");
    return `${formatted} ${meta.code || currency}`;
  }

  function formatApcAll() {
    const rub = formatApc("RUB");
    const cny = formatApc("CNY");
    return rub === cny ? rub : `${rub} / ${cny}`;
  }

  function volumeLabel() {
    const year = CFG.currentYear || 2026;
    const lang = window.BSi18n?.getLanguage?.() || CFG.defaultLanguage || "ru";
    if (CFG.specialIssue) {
      if (lang === "ru") return `Спецвыпуск · ${year}`;
      if (lang === "zh") return `专刊 · ${year}`;
      if (lang === "ar") return `عدد خاص · ${year}`;
      return `Special issue · ${year}`;
    }
    const vol = CFG.volumeNumber || 1;
    if (lang === "ru") return `Том ${vol} · ${year}`;
    if (lang === "zh") return `第 ${vol} 卷 · ${year}`;
    if (lang === "ar") return `المجلد ${vol} · ${year}`;
    return `Vol. ${vol} · ${year}`;
  }

  function langBrandName() {
    const lang = window.BSi18n?.getLanguage?.() || CFG.defaultLanguage || "ru";
    if (lang === "ru") return NAME_RU;
    if (lang === "ar" || lang === "zh") return t("home.hero.brand") || NAME;
    return NAME;
  }

  function brandSubtitle() {
    return (
      CFG.journalSubtitle ||
      CFG.journalSubtitleEn ||
      "An International Journal of Biological Research and Methodology"
    );
  }

  /** Submit CTA: local form until OJS URL is configured. */
  function submitHref() {
    if (CFG.submissionMode === "ojs" && CFG.ojsUrl) return String(CFG.ojsUrl);
    if (CFG.ojsEnabled && CFG.ojsUrl) return String(CFG.ojsUrl);
    return "submit.html";
  }

  function submitTargetAttrs() {
    const href = submitHref();
    const external = /^https?:\/\//i.test(href);
    return {
      href,
      attrs: external ? ' target="_blank" rel="noopener"' : "",
      external,
    };
  }

  Object.assign(window.BS, {
    formatApc,
    formatApcAll,
    formatIssn,
    contactEmail,
    volumeLabel,
    submitHref,
    CFG,
    NAME,
  });

  function boot() {
    const saved = (() => {
      try {
        return localStorage.getItem("bs_lang") || CFG.defaultLanguage || "ru";
      } catch {
        return CFG.defaultLanguage || "ru";
      }
    })();
    bindLanguage();
    bindInternalLinks();
    applyLanguage(saved, false);
    mountPageBanner();
    // Hybrid agent: FAQ + text check on Pages; full file/ticket API when server.py is up.
    if (CFG.chatEnabled && window.BSChat) window.BSChat.mount();
    // Auth header slot (login.html / account.html load auth.js themselves)
    if (!document.querySelector('script[src*="auth.js"]')) {
      const s = document.createElement("script");
      s.src = "assets/js/auth.js?v=m21";
      s.defer = true;
      document.body.appendChild(s);
    } else {
      window.BSAuth?.refreshHeaderAuth?.();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function mountShell() {
    const headerHost = document.getElementById("site-header");
    const footerHost = document.getElementById("site-footer");
    if (headerHost) headerHost.innerHTML = renderHeader();
    if (footerHost) footerHost.innerHTML = renderFooter();
    bindHeader();
  }

  const MARGIN_NOTE_KEYS = [
    "margin.special",
    "margin.glucose",
    "margin.protein",
    "margin.peptide",
    "margin.atp",
    "margin.metabolite",
    "margin.enzyme",
    "margin.spectrum",
    "margin.lcms",
    "margin.mz",
    "margin.nmr",
    "margin.pcr",
    "margin.chromatogram",
    "margin.pipette",
    "margin.buffer",
    "margin.lab",
    "margin.aa",
    "margin.bases",
    "margin.ph",
    "margin.mm",
    "margin.gibbs",
    "margin.cell",
    "margin.membrane",
    "margin.genome",
    "margin.metabolism",
    "margin.immunity",
    "margin.trypsin",
    "margin.heme",
    "margin.lipid",
    "margin.cofactor",
    "margin.phosphate",
    "margin.benzene",
  ];

  function shuffledMarginLabels() {
    const keys = MARGIN_NOTE_KEYS.slice();
    for (let i = keys.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    return keys.map((key) => {
      const text = t(key);
      return text === key ? null : text;
    }).filter(Boolean);
  }

  function mountMarginField() {
    try {
      if (CFG.marginNotesEnabled === false) return;
      if (window.matchMedia("(max-width: 1399px)").matches) {
        document.querySelector(".page-margin-field")?.remove();
        return;
      }

      const labels = shuffledMarginLabels();
      if (!labels.length) return;

      const left = labels.slice(0, 16);
      const right = labels.slice(16, 32);
      const noteHtml = (word) => `<p class="mf-note">${escapeHtml(word)}</p>`;

      let host = document.querySelector(".page-margin-field");
      if (!host) {
        host = document.createElement("div");
        host.className = "page-margin-field";
        host.setAttribute("aria-hidden", "true");
        host.innerHTML = `<div class="page-margin-field-col is-left"></div><div class="page-margin-field-col is-right"></div>`;
        document.body.prepend(host);
      }
      const leftCol = host.querySelector(".is-left");
      const rightCol = host.querySelector(".is-right");
      if (leftCol) leftCol.innerHTML = left.map(noteHtml).join("");
      if (rightCol) rightCol.innerHTML = right.map(noteHtml).join("");
    } catch (err) {
      console.warn("margin field", err);
    }
  }

  function mountPageBanner() {
    if (PAGE === "home" || document.querySelector(".hero-banner")) return;
    const header = document.getElementById("site-header");
    const banner = document.createElement("section");
    banner.className = "hero-banner hero-banner-page";
    banner.setAttribute("aria-hidden", "true");
    banner.innerHTML = `<div class="hero-banner-inner container"><div data-spectrum-slot></div><p class="hero-brand">${escapeHtml(NAME)}</p></div>`;
    if (header && header.parentNode) header.after(banner);
    else document.body.prepend(banner);
    const slot = banner.querySelector("[data-spectrum-slot]");
    const apply = (svg) => {
      if (!slot || !svg) return;
      slot.outerHTML = svg.includes("hero-waves") ? svg : svg.replace("<svg", '<svg class="hero-waves"');
    };
    if (window.__bsSpectrumSvg) {
      apply(window.__bsSpectrumSvg);
      return;
    }
    fetch("assets/img/hero-spectrum.svg", { cache: "force-cache" })
      .then((res) => (res.ok ? res.text() : ""))
      .then((svg) => {
        window.__bsSpectrumSvg = svg;
        apply(svg);
      })
      .catch(() => {});
  }

  function dropdown(id, labelKey, items) {
    const open = items.some((item) => item.id === PAGE && !item.external);
    const links = items
      .map((item) => {
        const ext = item.external || /^https?:\/\//i.test(item.href || "");
        const target = ext ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${pageHref(item.href)}" class="${!ext && item.id === PAGE ? "is-active" : ""}" data-i18n="${item.labelKey}"${target}>${t(item.labelKey)}</a>`;
      })
      .join("");
    return `
      <div class="nav-dd ${open ? "is-open" : ""}" data-nav-dd>
        <button type="button" class="nav-dd-btn ${open ? "is-active" : ""}" aria-expanded="${open}" data-i18n="${labelKey}">${t(labelKey)}</button>
        <div class="nav-dd-menu">${links}</div>
      </div>`;
  }

  function renderHeader() {
    const materials = [
      { href: "articles.html", id: "articles", labelKey: "nav.materials.all" },
      { href: "articles.html?type=original-research", id: "articles", labelKey: "nav.materials.original" },
      { href: "articles.html?type=methods", id: "articles", labelKey: "nav.materials.methods" },
      { href: "articles.html?type=short", id: "articles", labelKey: "nav.materials.short" },
      { href: "articles.html?type=reviews", id: "articles", labelKey: "nav.materials.reviews" },
      { href: "articles.html?type=perspectives", id: "articles", labelKey: "nav.materials.perspectives" },
      { href: "negative-results.html", id: "negative-results", labelKey: "nav.materials.negative" },
      { href: "articles.html?type=null", id: "articles", labelKey: "nav.materials.null" },
      { href: "articles.html?type=replication", id: "articles", labelKey: "nav.materials.replication" },
      { href: "articles.html?type=registered", id: "articles", labelKey: "nav.materials.registered" },
      { href: "articles.html?type=interviews", id: "articles", labelKey: "nav.materials.interviews" },
      { href: "articles.html?type=success", id: "articles", labelKey: "nav.materials.success" },
    ];
    const about = [
      { href: "aims.html", id: "aims", labelKey: "nav.about.aims" },
      { href: "editorial.html", id: "editorial", labelKey: "nav.about.board" },
      { href: "publisher.html", id: "publisher", labelKey: "nav.about.publisher" },
      { href: "open-access.html", id: "open-access", labelKey: "nav.about.oa" },
      { href: "history.html", id: "history", labelKey: "nav.about.history" },
      { href: "news.html", id: "news", labelKey: "nav.about.news" },
      { href: "contact.html", id: "contact", labelKey: "nav.about.contact" },
    ];
    const authors = [
      { href: "authors-guidelines.html", id: "authors-guidelines", labelKey: "nav.authors.guidelines" },
      { href: "article-types.html", id: "article-types", labelKey: "nav.authors.types" },
      { href: "authors-files.html", id: "authors-files", labelKey: "nav.authors.files" },
      { href: "process.html", id: "process", labelKey: "nav.authors.process" },
      { href: "apc.html", id: "apc", labelKey: "nav.authors.apc" },
      { href: "data-policy.html", id: "data-policy", labelKey: "footer.data" },
      { href: "publication-ethics.html", id: "publication-ethics", labelKey: "nav.authors.ethics" },
      { href: submitHref(), id: "submit", labelKey: "nav.authors.submit", external: /^https?:\/\//i.test(submitHref()) },
    ];
    const editors = [
      { href: "peer-review.html", id: "peer-review", labelKey: "footer.peer" },
      { href: "editors-guide.html", id: "editors-guide", labelKey: "nav.editors.guide" },
      { href: "reviewers-guide.html", id: "reviewers-guide", labelKey: "nav.editors.reviewers" },
      { href: "conflicts.html", id: "conflicts", labelKey: "nav.editors.coi" },
      { href: "join.html", id: "join", labelKey: "nav.editors.join" },
      { href: "confidentiality.html", id: "confidentiality", labelKey: "nav.editors.conf" },
    ];

    const confLink = CFG.conferenceEnabled
      ? `<a href="${pageHref("conferences.html")}" class="${PAGE === "conferences" ? "is-active" : ""}" data-i18n="nav.conferences">${t("nav.conferences")}</a>`
      : "";
    const sub = submitTargetAttrs();

    return `
      <div class="topbar">
        <div class="container topbar-inner">
          <div class="topbar-left">
            <span class="id-num"><span>ISSN</span> <em data-cfg-issn>${formatIssn()}</em></span>
            <span class="id-num"><span>eISSN</span> <em data-cfg-eissn>${formatEissn()}</em></span>
            <span class="id-num"><span data-i18n="top.regId">${t("top.regId")}</span> <em>№ ФС77-82357</em></span>
            <span class="dot" aria-hidden="true"></span>
            <span data-cfg-volume>${volumeLabel()}</span>
            <span class="dot" aria-hidden="true"></span>
            <span data-i18n="top.oa">Open Access</span>
          </div>
          <div class="topbar-right">
            <span class="lang" role="group" aria-label="${t("lang.hint")}">
              <a href="#" data-lang="en" aria-label="English">EN</a>
              <a href="#" data-lang="ru" aria-label="Русский">RU</a>
              <a href="#" data-lang="zh" aria-label="中文">中文</a>
              <a href="#" data-lang="ar" aria-label="العربية">عربي</a>
            </span>
          </div>
        </div>
      </div>
      <div class="header-bar">
        <div class="container header-inner compact-header">
          <a class="brand" href="index.html" aria-label="${escapeAttr(langBrandName())}">
            <span class="brand-text">
              <span class="brand-name" data-i18n="home.hero.brand">${escapeHtml(langBrandName())}</span>
              <span class="brand-tag" data-i18n="brand.subtitle">${escapeHtml(t("brand.subtitle"))}</span>
              <span class="brand-acronym" aria-label="Acronym">${escapeHtml(ACRONYM)}</span>
            </span>
          </a>
          <div class="header-actions">
            <span id="auth-nav-slot" class="auth-nav-slot"><a href="login.html" class="nav-link-auth" data-i18n="nav.login">${t("nav.login")}</a></span>
            <a href="${sub.href}" class="nav-cta ${PAGE === "submit" && !sub.external ? "is-active" : ""}" data-i18n="nav.submit"${sub.attrs}>${t("nav.submit")}</a>
            <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="${t("nav.menu")}">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
      <div class="nav-bar">
        <div class="container nav-bar-inner">
          <nav class="nav nav-mega" id="site-nav" aria-label="Primary">
            ${dropdown("materials", "nav.materials", materials)}
            ${dropdown("about", "nav.about", about)}
            <a href="issues.html" class="${PAGE === "issues" ? "is-active" : ""}" data-i18n="nav.issues">${t("nav.issues")}</a>
            ${dropdown("authors", "nav.authors", authors)}
            ${dropdown("editors", "nav.editors", editors)}
            <a href="policies.html" class="${PAGE === "policies" ? "is-active" : ""}" data-i18n="nav.policies">${t("nav.policies")}</a>
            ${confLink}
            <a href="contact.html" class="${PAGE === "contact" ? "is-active" : ""}" data-i18n="nav.contact">${t("nav.contact")}</a>
          </nav>
        </div>
      </div>`;
  }

  function renderFooter() {
    const year = CFG.currentYear || new Date().getFullYear();
    const tagline = t("footer.tagline");

    return `
      <div class="container footer-grid footer-4">
        <div class="footer-brand-block">
          <strong class="footer-brand" data-i18n="home.hero.brand">${escapeHtml(langBrandName())}</strong>
          <p>${tagline}</p>
        </div>
        <div>
          <h4 data-i18n="footer.journal">${t("footer.journal")}</h4>
          <a href="about.html" data-i18n="nav.about">${t("nav.about")}</a>
          <a href="issues.html" data-i18n="nav.issues">${t("nav.issues")}</a>
          <a href="articles.html" data-i18n="nav.articles">${t("nav.articles")}</a>
          <a href="aims.html" data-i18n="nav.about.aims">${t("nav.about.aims")}</a>
          <a href="editorial.html" data-i18n="nav.about.board">${t("nav.about.board")}</a>
          <a href="contact.html" data-i18n="nav.contact">${t("nav.contact")}</a>
        </div>
        <div>
          <h4 data-i18n="footer.authors">${t("footer.authors")}</h4>
          <a href="${submitHref()}" data-i18n="nav.submit"${submitTargetAttrs().attrs}>${t("nav.submit")}</a>
          <a href="authors-guidelines.html" data-i18n="nav.authors.guidelines">${t("nav.authors.guidelines")}</a>
          <a href="article-types.html" data-i18n="nav.authors.types">${t("nav.authors.types")}</a>
          <a href="apc.html" data-i18n="nav.authors.apc">${t("nav.authors.apc")}</a>
          <a href="data-policy.html" data-i18n="footer.data">${t("footer.data")}</a>
        </div>
        <div>
          <h4 data-i18n="footer.policies">${t("footer.policies")}</h4>
          <a href="peer-review.html">${t("footer.peer")}</a>
          <a href="publication-ethics.html">${t("footer.ethics")}</a>
          <a href="authorship.html">${t("footer.authorship")}</a>
          <a href="conflicts.html">${t("footer.coi")}</a>
          <a href="corrections.html">${t("footer.corrections")}</a>
          <a href="complaints.html">${t("footer.complaints")}</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>© ${year} ${escapeHtml(langBrandName())}</p>
        <p class="footer-legal">
          <a href="privacy.html" data-i18n="footer.privacy">${t("footer.privacy")}</a>
          <a href="terms.html" data-i18n="footer.terms">${t("footer.terms")}</a>
          <a href="cookies.html" data-i18n="footer.cookies">${t("footer.cookies")}</a>
          <a href="accessibility.html" data-i18n="footer.accessibility">${t("footer.accessibility")}</a>
        </p>
      </div>`;
  }

  function bindHeader() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");

    toggle?.addEventListener("click", () => {
      if (!nav) return;
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });

    nav?.querySelectorAll("[data-nav-dd]").forEach((dd) => {
      const btn = dd.querySelector(".nav-dd-btn");
      btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !dd.classList.contains("is-open");
        nav.querySelectorAll("[data-nav-dd]").forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector(".nav-dd-btn")?.setAttribute("aria-expanded", "false");
        });
        dd.classList.toggle("is-open", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
      });
    });

    document.addEventListener("click", (e) => {
      if (!nav || nav.contains(e.target)) return;
      nav.querySelectorAll("[data-nav-dd]").forEach((dd) => {
        dd.classList.remove("is-open");
        dd.querySelector(".nav-dd-btn")?.setAttribute("aria-expanded", "false");
      });
    });

    nav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  function hydrateApc() {
    document.querySelectorAll("[data-apc]").forEach((el) => {
      const mode = el.getAttribute("data-apc");
      el.textContent = mode === "all" ? formatApcAll() : formatApc(mode || "RUB");
    });
  }

  function hydrateConfig() {
    document.querySelectorAll("[data-cfg-issn]").forEach((el) => {
      el.textContent = formatIssn();
    });
    document.querySelectorAll("[data-cfg-eissn]").forEach((el) => {
      el.textContent = formatEissn();
    });
    document.querySelectorAll("[data-cfg-volume]").forEach((el) => {
      el.textContent = volumeLabel();
    });
    document.querySelectorAll("[data-cfg-email]").forEach((el) => {
      const email = contactEmail();
      el.textContent = email;
      if (el.tagName === "A") el.setAttribute("href", `mailto:${email}`);
    });
    document.querySelectorAll("[data-cfg]").forEach((el) => {
      const key = el.getAttribute("data-cfg");
      const val = key ? CFG[key] : null;
      el.textContent = val == null || val === "" ? (pagePack().extras.emptyTba || t("empty.tba") || "—") : String(val);
    });

    const roles = {
      support: CFG.emails?.support,
      submissions: CFG.emails?.submissions,
      ethics: CFG.emails?.ethics,
      editorial: CFG.emails?.editorial,
    };
    document.querySelectorAll("[data-contact-role]").forEach((el) => {
      const role = el.getAttribute("data-contact-role");
      const email = roles[role];
      if (email) {
        el.innerHTML = `<a href="mailto:${email}">${email}</a>`;
      } else {
        const fallback = contactEmail();
        el.innerHTML = `<a href="mailto:${fallback}">${fallback}</a>`;
      }
    });

    document.querySelectorAll("[data-stat]").forEach((el) => {
      const key = el.getAttribute("data-stat");
      const val = key ? CFG[key] : 0;
      el.textContent = String(val ?? 0);
    });

    const statsBlock = document.getElementById("home-stats-block");
    if (statsBlock) {
      const hasData = ["articlesCount", "issuesCount", "authorsCount", "editorsCount", "reviewersCount", "countriesCount"].some(
        (key) => Number(CFG[key] || 0) > 0
      );
      statsBlock.hidden = !hasData;
    }

    document.querySelectorAll("[data-tooltip-key]").forEach((el) => {
      const key = el.getAttribute("data-tooltip-key");
      if (key) el.title = t(key);
    });

    hydrateCommunityChannels();
    hydratePartnersAndFunding();
    hydrateJournalRecord();
  }

  function formatRuDateFromIso(iso) {
    if (!iso || typeof iso !== "string") return "—";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    return `${d}.${m}.${y}`;
  }

  function journalRcsiCards() {
    if (Array.isArray(CFG.journalRcsiCards) && CFG.journalRcsiCards.length) {
      return CFG.journalRcsiCards;
    }
    if (CFG.journalRecord) {
      return [
        {
          id: "legacy",
          titleKey: "home.rcsi.kicker.ru",
          issn: CFG.issn,
          eissn: CFG.eissn,
          ...CFG.journalRecord,
        },
      ];
    }
    return [];
  }

  function issnLineForCard(card) {
    return [card.issn, card.eissn].filter(Boolean).join(" · ") || "—";
  }

  function fillIndexingChips(wrap, names, inline) {
    if (!wrap) return;
    wrap.textContent = "";
    if (!names.length) {
      wrap.textContent = pagePack().extras.emptyTba || t("empty.tba") || "—";
      return;
    }
    names.forEach((name) => {
      const chip = document.createElement("span");
      chip.className = inline ? "indexing-chip indexing-chip--inline" : "indexing-chip";
      chip.textContent = name;
      wrap.appendChild(chip);
    });
  }

  function renderHomeRcsiBlock(card) {
    const issnLine = issnLineForCard(card);
    const strip = document.createElement("section");
    strip.className = "info-strip";
    const kickerId = `home-rcsi-${card.id}`;
    strip.setAttribute("aria-labelledby", kickerId);

    const gridItems = [
      {
        labelKey: "home.rcsi.issn",
        value: issnLine,
        tipKey: card.legacyIssn ? "home.rcsi.issn.tip" : null,
      },
      { labelKey: "home.rcsi.vak", value: card.vakWhiteListLevel == null ? "—" : String(card.vakWhiteListLevel), tipKey: "home.rcsi.vak.tip" },
      { labelKey: "home.rcsi.included", value: formatRuDateFromIso(card.whiteListIncludedDate) },
      { labelKey: "home.rcsi.doi", value: card.doiRegistrationAgency || "—" },
    ];

    const gridHtml = gridItems
      .map((item) => {
        const tip =
          item.tipKey || item.tipText
            ? `<span class="info-tip"${item.tipKey ? ` data-i18n="${item.tipKey}"` : ""}>${item.tipText || t(item.tipKey)}</span>`
            : "";
        const tooltip = item.tipKey ? ` data-tooltip-key="${item.tipKey}"` : "";
        return `<div class="info-item"${tooltip}>
          <span class="info-label" data-i18n="${item.labelKey}">${t(item.labelKey)}</span>
          <strong>${item.value}</strong>${tip}
        </div>`;
      })
      .join("");

    strip.innerHTML = `<div class="container">
      <p class="info-strip-kicker" id="${kickerId}" data-i18n="${card.titleKey}">${t(card.titleKey)}</p>
      <div class="info-strip-grid">${gridHtml}</div>
    </div>`;

    const bar = document.createElement("section");
    bar.className = "indexing-bar";
    bar.setAttribute("aria-label", t("home.rcsi.indexing"));
    const barInner = document.createElement("div");
    barInner.className = "container";
    const label = document.createElement("span");
    label.className = "indexing-bar-label";
    label.setAttribute("data-i18n", "home.rcsi.indexing");
    label.textContent = t("home.rcsi.indexing");
    const chips = document.createElement("div");
    chips.className = "indexing-chips";
    fillIndexingChips(chips, Array.isArray(card.indexing) ? card.indexing : [], false);
    barInner.appendChild(label);
    barInner.appendChild(chips);
    if (card.rcsiCardUrl) {
      const foot = document.createElement("p");
      foot.className = "rcsi-footnote";
      const a = document.createElement("a");
      a.className = "text-link";
      a.href = card.rcsiCardUrl;
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      a.setAttribute("data-i18n", "home.rcsi.card");
      a.textContent = t("home.rcsi.card");
      foot.appendChild(a);
      barInner.appendChild(foot);
    }
    bar.appendChild(barInner);

    return [strip, bar];
  }

  function renderAboutRcsiPanel(card) {
    const panel = document.createElement("div");
    panel.className = "dl-panel rcsi-about-panel";
    panel.id = `about-rcsi-${card.id}`;

    const dl = document.createElement("dl");
    const rows = [
      { dtKey: "home.rcsi.issn", dd: issnLineForCard(card) },
      card.legacyIssn ? { dtKey: "about.rcsi.legacyIssn", dd: card.legacyIssn } : null,
      { dtKey: "home.rcsi.vak", dd: card.vakWhiteListLevel == null ? "—" : String(card.vakWhiteListLevel) },
      { dtKey: "home.rcsi.included", dd: formatRuDateFromIso(card.whiteListIncludedDate) },
      { dtKey: "home.rcsi.doi", dd: card.doiRegistrationAgency || "—" },
      card.language ? { dtKey: "about.rcsi.language", dd: card.language, noI18n: true } : null,
      card.countries && card.countries.length ? { dtKey: "about.rcsi.countries", dd: card.countries.join(", "), noI18n: true } : null,
    ].filter(Boolean);

    rows.forEach((row) => {
      const dt = document.createElement("dt");
      if (!row.noI18n) dt.setAttribute("data-i18n", row.dtKey);
      dt.textContent = t(row.dtKey);
      const dd = document.createElement("dd");
      dd.textContent = row.dd;
      dl.appendChild(dt);
      dl.appendChild(dd);
    });

    const idxDt = document.createElement("dt");
    idxDt.setAttribute("data-i18n", "home.rcsi.indexing");
    idxDt.textContent = t("home.rcsi.indexing");
    const idxDd = document.createElement("dd");
    fillIndexingChips(idxDd, Array.isArray(card.indexing) ? card.indexing : [], true);
    dl.appendChild(idxDt);
    dl.appendChild(idxDd);

    const title = document.createElement("h3");
    title.className = "rcsi-about-title";
    title.setAttribute("data-i18n", card.titleKey);
    title.textContent = t(card.titleKey);

    panel.appendChild(title);
    panel.appendChild(dl);

    if (card.rcsiCardUrl) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = card.rcsiCardUrl;
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      a.setAttribute("data-i18n", "home.rcsi.card");
      a.textContent = t("home.rcsi.card");
      p.appendChild(a);
      panel.appendChild(p);
    }

    return panel;
  }

  function hydrateJournalRecord() {
    const cards = journalRcsiCards();
    if (!cards.length) return;

    const homeRoot = document.getElementById("home-rcsi-root");
    if (homeRoot) {
      homeRoot.textContent = "";
      cards.forEach((card) => {
        renderHomeRcsiBlock(card).forEach((node) => homeRoot.appendChild(node));
      });
    }

    const aboutRoot = document.getElementById("about-rcsi-root");
    if (aboutRoot) {
      aboutRoot.textContent = "";
      cards.forEach((card) => aboutRoot.appendChild(renderAboutRcsiPanel(card)));
    }
  }

  function hydrateCommunityChannels() {
    const channels = CFG.communityChannels || {};
    const links = {
      max: channels.maxUrl,
      telegram: channels.telegramUrl,
    };

    document.querySelectorAll("#home-call-channels").forEach((wrap) => {
      if (!wrap) return;
      let visible = 0;
      wrap.querySelectorAll("[data-channel]").forEach((el) => {
        const key = el.getAttribute("data-channel");
        const url = key ? links[key] : null;
        if (url) {
          el.setAttribute("href", url);
          el.hidden = false;
          visible += 1;
        } else {
          el.hidden = true;
          el.removeAttribute("href");
        }
      });
      if (wrap.id === "home-call-channels") {
        wrap.hidden = visible === 0;
      }
    });
  }

  function hydratePartnersAndFunding() {
    const partners = Array.isArray(CFG.partners) ? CFG.partners : [];
    const funding = Array.isArray(CFG.fundingInfo) ? CFG.fundingInfo : [];
    const partnersPanel = document.querySelector("[data-partners-panel]");
    const partnersGrid = document.querySelector("[data-partners-grid]");
    if (partnersPanel && partnersGrid) {
      if (!partners.length) {
        partnersPanel.hidden = true;
        partnersGrid.innerHTML = "";
      } else {
        partnersPanel.hidden = false;
        partnersGrid.innerHTML = partners
          .map((p) => {
            const name = escapeHtml(p.name || "Partner");
            const logo = p.logoUrl
              ? `<img src="${escapeAttr(p.logoUrl)}" alt="${name}" loading="lazy" />`
              : `<span class="partner-fallback">${name.slice(0, 1)}</span>`;
            const inner = `${logo}<span class="partner-name">${name}</span>`;
            return p.url
              ? `<li class="partner-card"><a href="${escapeAttr(p.url)}" target="_blank" rel="noopener">${inner}</a></li>`
              : `<li class="partner-card">${inner}</li>`;
          })
          .join("");
      }
    }

    const fundingPanel = document.querySelector("[data-funding-panel]");
    const fundingList = document.querySelector("[data-funding-list]");
    if (fundingPanel && fundingList) {
      if (!funding.length) {
        fundingPanel.hidden = true;
        fundingList.innerHTML = "";
      } else {
        fundingPanel.hidden = false;
        fundingList.innerHTML = funding
          .map((f) => {
            const award = f.awardId ? ` — ${escapeHtml(f.awardId)}` : "";
            const link = f.url
              ? ` <a href="${escapeAttr(f.url)}" target="_blank" rel="noopener">↗</a>`
              : "";
            return `<li><strong>${escapeHtml(f.funderName || f.id || "Funder")}</strong>${award}${link}</li>`;
          })
          .join("");
      }
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("'", "&#39;");
  }

  function pagePack() {
    const lang = window.BSi18n?.getLanguage?.() || "ru";
    const root = window.BSPageI18n || {};
    return {
      headers: root.headers?.[lang] || root.headers?.en || {},
      cards: root.cards?.[lang] || root.cards?.en || {},
      extras: root.extras?.[lang] || root.extras?.en || {},
    };
  }

  function hydrateProse() {
    if (!PAGE || PAGE === "home") return;
    const lang = window.BSi18n?.getLanguage?.() || "ru";
    const root = window.BSPageI18n || {};
    const block = root.prose?.[lang]?.[PAGE] || root.prose?.en?.[PAGE] || {};
    const bodies = root.bodies?.[lang]?.[PAGE] || root.bodies?.en?.[PAGE] || [];
    (block.h2 || []).forEach((text, i) => {
      const el = document.querySelectorAll(".prose-block h2")[i];
      if (el && text) el.textContent = text;
    });
    const listItems = document.querySelectorAll(".prose-block li");
    (block.li || []).forEach((text, i) => {
      const el = listItems[i];
      if (!el || !text || el.querySelector("a, input, textarea, select, button")) return;
      el.textContent = text;
    });
    const paras = [];
    document.querySelectorAll(".prose-block p").forEach((p) => {
      if (p.classList.contains("form-note") || p.classList.contains("apc-figure")) return;
      if (p.closest("li, .policy-card, .apc-panel")) return;
      if (p.querySelector("a, input, textarea, select, button, [data-apc]")) return;
      paras.push(p);
    });
    paras.forEach((p, i) => {
      const text = (block.p && block.p[i]) || bodies[i];
      if (text) p.textContent = text;
    });
  }

  function hydratePageChrome() {
    const { headers, cards, extras } = pagePack();
    const meta = headers[PAGE];
    const skip = document.querySelector(".skip-link");
    if (skip && !skip.hasAttribute("data-i18n")) skip.textContent = t("a11y.skip");

    if (meta) {
      const kicker = document.querySelector(".page-kicker");
      const h1 = document.querySelector(".page-header h1");
      const lede = document.querySelector(".page-header .page-lede");
      if (kicker && meta.kicker) kicker.textContent = meta.kicker;
      if (h1 && meta.h1) h1.textContent = meta.h1;
      if (lede && meta.lede) lede.textContent = meta.lede;
      if (meta.title && PAGE !== "home") {
        document.title = `${meta.title} — ${langBrandName()}`;
      }
      const emptyH2 = document.querySelector(".page-main .empty-state h2, .container > .empty-state h2");
      if (emptyH2 && meta.h1) emptyH2.textContent = meta.h1;
    }

    document.querySelectorAll(".link-list a[href]").forEach((a) => {
      const raw = a.getAttribute("href") || "";
      const href = raw.split("#")[0];
      const copy = cards[raw] || cards[href];
      if (copy?.title) a.textContent = copy.title;
    });

    document.querySelectorAll("a.policy-card[href]").forEach((card) => {
      const raw = card.getAttribute("href") || "";
      const href = raw.split("#")[0];
      const copy = cards[raw] || cards[href];
      if (!copy) return;
      const h2 = card.querySelector("h2");
      const p = card.querySelector("p");
      if (h2 && copy.title) h2.textContent = copy.title;
      if (p && copy.blurb) p.textContent = copy.blurb;
    });

    const dts = extras.publisherDts || [];
    document.querySelectorAll("[data-publisher-panel] dt").forEach((dt, i) => {
      if (dts[i]) dt.textContent = dts[i];
    });
    const pubNote = document.querySelector("[data-publisher-panel] .form-note");
    if (pubNote && extras.publisherContact) {
      const a = pubNote.querySelector("a");
      pubNote.replaceChildren(`${extras.publisherContact} `, a || "");
    }
    const partnersH2 = document.querySelector("#partners-panel h2");
    if (partnersH2 && extras.partnersTitle) partnersH2.textContent = extras.partnersTitle;
    const partnersLede = document.querySelector("#partners-panel .page-lede");
    if (partnersLede && extras.partnersLede) partnersLede.textContent = extras.partnersLede;
    const fundingH2 = document.querySelector("#funding-panel h2");
    if (fundingH2 && extras.fundingTitle) fundingH2.textContent = extras.fundingTitle;

    const contactMap = [
      extras.contactCoord,
      extras.contactSupport,
      extras.contactSub,
      extras.contactEthics,
    ];
    document.querySelectorAll("#contact-panel h2").forEach((h2, i) => {
      if (contactMap[i]) h2.textContent = contactMap[i];
    });

    const historyEmpty = document.querySelector('body[data-page="history"] .empty-state p');
    if (historyEmpty && extras.historyEmpty) historyEmpty.textContent = extras.historyEmpty;
    const newsEmpty = document.querySelector('body[data-page="news"] .empty-state p');
    if (newsEmpty && extras.newsEmpty) newsEmpty.textContent = extras.newsEmpty;
    const boardPs = document.querySelectorAll('body[data-page="editorial"] .empty-state p');
    if (boardPs.length && extras.boardEmpty) {
      boardPs[0].textContent = extras.boardEmpty;
      if (boardPs[1] && !boardPs[1].querySelector("a")) boardPs[1].hidden = true;
    }
    const joinCta = document.querySelector('body[data-page="editorial"] .empty-state a[href="join.html"]');
    if (joinCta && cards["join.html"]?.title) joinCta.textContent = cards["join.html"].title;

    if (PAGE === "conferences" && CFG.conferenceEnabled === false) {
      const box = document.getElementById("conference-empty");
      if (box) {
        box.hidden = false;
        const h2 = box.querySelector("h2");
        const p = box.querySelector("p");
        if (h2 && extras.confOffTitle) h2.textContent = extras.confOffTitle;
        if (p && extras.confOffBody) p.textContent = extras.confOffBody;
      }
      const list = document.getElementById("conference-list");
      if (list) {
        list.hidden = true;
        list.innerHTML = "";
      }
    }

    if (PAGE === "join") {
      Object.entries(extras.joinLabels || {}).forEach(([id, text]) => setLabelLead(id, text));
      const role = document.getElementById("role");
      if (role && extras.joinRoles) {
        role.querySelectorAll("option[value]").forEach((opt) => {
          const val = opt.getAttribute("value");
          if (!val) return;
          if (extras.joinRoles[val]) opt.textContent = extras.joinRoles[val];
        });
      }
      const consent = document.querySelector("#policyConsent")?.closest("label")?.querySelector("span");
      if (consent && extras.joinConsent) consent.textContent = extras.joinConsent;
      const submitBtn = document.querySelector("#apply-form button[type='submit']");
      if (submitBtn && extras.joinSubmit) submitBtn.textContent = extras.joinSubmit;
      const draftBtn = document.getElementById("apply-draft-btn");
      if (draftBtn && extras.joinDraft) draftBtn.textContent = extras.joinDraft;
      const note = document.querySelector("#apply-form .form-note");
      if (note && extras.joinNote) note.textContent = extras.joinNote;
      const pub = document.getElementById("publications");
      if (pub && extras.joinPubPlaceholder) pub.setAttribute("placeholder", extras.joinPubPlaceholder);
    }

    if (PAGE === "login") {
      const notes = document.querySelectorAll(".auth-panel .form-note:not(#auth-status)");
      if (notes[0] && extras.loginOAuth) notes[0].textContent = extras.loginOAuth;
      if (notes[1] && extras.loginRedirect) notes[1].textContent = extras.loginRedirect;
    }

    if (PAGE === "submit") {
      const tpl = document.querySelector(".page-header a[download]");
      if (tpl && extras.submitTemplate) tpl.textContent = extras.submitTemplate;
      const guide = document.querySelector(".page-header a[href='authors-guidelines.html']");
      if (guide && extras.submitGuidelines) guide.textContent = extras.submitGuidelines;
      const newH2 = document.querySelector("#form-section > h2");
      if (newH2 && extras.submitNew) newH2.textContent = extras.submitNew;
      setLabelLead("funding", extras.submitFunding);
      setLabelLead("dataIdentifiers", extras.submitDataIds);
      const dataHint = document.querySelector("#dataIdentifiers")?.closest("label")?.querySelector(".hint");
      if (dataHint && extras.submitDataHint) dataHint.textContent = extras.submitDataHint;
      const apcNote = document.querySelector("#form-section > .form-note");
      if (apcNote && extras.submitApcNote) {
        apcNote.textContent = extras.submitApcNote;
      }
      const fair = document.querySelector("#fairData")?.closest("label")?.querySelector("span");
      if (fair && extras.submitFair) fair.textContent = extras.submitFair;
    }
  }

  function setLabelLead(id, text) {
    const input = document.getElementById(id);
    if (!input || !text) return;
    const label = input.closest("label");
    if (!label) return;
    for (const node of label.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        node.textContent = `${text} `;
        return;
      }
    }
  }

  function pageHref(href) {
    if (!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return href;
    if (/[?&]v=/.test(href)) return href;
    return href.includes("?") ? `${href}&v=${ASSET_V}` : `${href}?v=${ASSET_V}`;
  }

  function flattenPageI18n() {
    const i18n = window.BSi18n?.STRINGS;
    const root = window.BSPageI18n;
    if (!i18n || !root?.headers) return;
    for (const lang of Object.keys(root.headers)) {
      i18n[lang] = i18n[lang] || {};
      for (const [page, meta] of Object.entries(root.headers[lang] || {})) {
        if (meta.kicker) i18n[lang][`page.${page}.kicker`] = meta.kicker;
        if (meta.h1) i18n[lang][`page.${page}.h1`] = meta.h1;
        if (meta.lede) i18n[lang][`page.${page}.lede`] = meta.lede;
        if (meta.title) i18n[lang][`page.${page}.title`] = meta.title;
      }
    }
    if (root.bodies) {
      for (const lang of Object.keys(root.bodies)) {
        i18n[lang] = i18n[lang] || {};
        for (const [page, paras] of Object.entries(root.bodies[lang] || {})) {
          (paras || []).forEach((text, i) => {
            if (text) i18n[lang][`page.${page}.p${i}`] = text;
          });
        }
      }
    }
    if (!root.prose) return;
    for (const lang of Object.keys(root.prose)) {
      i18n[lang] = i18n[lang] || {};
      for (const [page, block] of Object.entries(root.prose[lang] || {})) {
        (block.h2 || []).forEach((text, i) => {
          if (text) i18n[lang][`page.${page}.h2.${i}`] = text;
        });
        (block.li || []).forEach((text, i) => {
          if (text) i18n[lang][`page.${page}.li.${i}`] = text;
        });
        (block.p || []).forEach((text, i) => {
          if (text) i18n[lang][`page.${page}.p${i}`] = text;
        });
      }
    }
  }

  function tagPageChrome() {
    if (!PAGE || PAGE === "home") return;
    const kicker = document.querySelector(".page-kicker");
    if (kicker) kicker.setAttribute("data-i18n", `page.${PAGE}.kicker`);
    const h1 = document.querySelector(".page-header h1");
    if (h1) h1.setAttribute("data-i18n", `page.${PAGE}.h1`);
    const lede = document.querySelector(".page-header .page-lede");
    if (lede) lede.setAttribute("data-i18n", `page.${PAGE}.lede`);
    document.querySelectorAll(".prose-block h2").forEach((el, i) => {
      if (el.hasAttribute("data-i18n")) return;
      el.setAttribute("data-i18n", `page.${PAGE}.h2.${i}`);
    });
    let pIndex = 0;
    document.querySelectorAll(".prose-block > p, .prose-block p").forEach((p) => {
      if (p.hasAttribute("data-i18n")) return;
      if (p.classList.contains("form-note") || p.classList.contains("apc-figure")) return;
      if (p.closest("li, .policy-card, .type-card, .scope-card, .apc-panel")) return;
      if (p.querySelector("a, input, textarea, select, button, svg, img, [data-apc]")) return;
      p.setAttribute("data-i18n", `page.${PAGE}.p${pIndex}`);
      pIndex += 1;
    });
    document.querySelectorAll(".prose-block li").forEach((el, i) => {
      if (el.hasAttribute("data-i18n")) return;
      if (el.querySelector("a, input, textarea, select, button, svg, img")) return;
      el.setAttribute("data-i18n", `page.${PAGE}.li.${i}`);
    });
  }

  function bindInternalLinks() {
    if (bindInternalLinks.bound) return;
    bindInternalLinks.bound = true;
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.getAttribute("target") === "_blank" || a.hasAttribute("download")) return;
      if (a.closest("[data-lang]")) return;
      const href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return;
      if (!/\.html(\?|#|$)/.test(href)) return;
      const next = pageHref(href);
      if (next === href) return;
      e.preventDefault();
      location.href = next;
    });
  }

  function applyLanguage(lang, persist) {
    flattenPageI18n();
    const packs = window.BSi18n?.STRINGS || {};
    if (lang === "ar") packs.ar = packs.ar || {};
    if (lang && !packs[lang]) {
      lang = packs[CFG.defaultLanguage] ? CFG.defaultLanguage : packs.en ? "en" : "ru";
    }
    if (!lang || !packs[lang]) return;
    window.BSi18n.setLanguage(lang);
    if (persist) {
      try {
        localStorage.setItem("bs_lang", lang);
      } catch {
        /* ignore */
      }
    }
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    tagPageChrome();
    mountShell();
    hydrateConfig();
    hydrateApc();
    tagPageChrome();
    window.BSi18n.setLanguage(lang);
    hydratePageChrome();
    hydrateProse();
    if (PAGE === "home") {
      const homeTitle = t("home.doc.title");
      if (homeTitle && homeTitle !== "home.doc.title") document.title = homeTitle;
    }
    mountMarginField();
    markLangSwitcher();
    window.dispatchEvent(new CustomEvent("bs:langchange", { detail: { lang } }));
  }

  function markLangSwitcher() {
    const lang = window.BSi18n?.getLanguage?.() || "ru";
    document.querySelectorAll("[data-lang]").forEach((el) => {
      const on = el.getAttribute("data-lang") === lang;
      el.classList.toggle("is-active", on);
      if (on) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
  }

  function bindLanguage() {
    if (bindLanguage.bound) {
      markLangSwitcher();
      return;
    }
    bindLanguage.bound = true;
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-lang]");
      if (!el) return;
      e.preventDefault();
      const lang = el.getAttribute("data-lang");
      applyLanguage(lang, true);
    });
    window.addEventListener("storage", (e) => {
      if (e.key !== "bs_lang" || !e.newValue) return;
      applyLanguage(e.newValue, false);
    });
    markLangSwitcher();
  }
})();
