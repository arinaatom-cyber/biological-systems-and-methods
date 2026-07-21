(() => {
  const CFG = window.BS_CONFIG || {};
  const PAGE = document.body?.dataset?.page || "";
  const NAME = CFG.journalName || "Biological Systems and Methods";
  const NAME_RU = CFG.journalNameRU || CFG.journalNameRu || "Биологические системы и методы";
  const ACRONYM = CFG.journalNameShort || CFG.journalAcronym || "BSM";
  window.BS = window.BS || {};
  window.BS.NAME = NAME;
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
    const v = CFG.issn || CFG.eissn;
    return v ? String(v) : "—";
  }

  function formatApc(currency = CFG.apc?.defaultCurrency || "RUB") {
    const meta = CFG.apc?.currencies?.[currency] || {
      amount: currency === "CNY" ? CFG.apcCNY : CFG.apcRUB,
      symbol: currency === "CNY" ? "¥" : "₽",
      code: currency,
    };
    const amount = meta.amount ?? (currency === "CNY" ? 6000 : 75000);
    const formatted = Number(amount).toLocaleString("ru-RU");
    return `${formatted} ${meta.code || currency}`;
  }

  function formatApcAll() {
    return `${formatApc("RUB")} / ${formatApc("CNY")}`;
  }

  function volumeLabel() {
    const vol = CFG.volumeNumber || 1;
    const year = CFG.currentYear || 2026;
    const lang = window.BSi18n?.getLanguage?.() || CFG.defaultLanguage || "ru";
    if (lang === "ru") return `Том ${vol} · ${year}`;
    if (lang === "zh") return `第 ${vol} 卷 · ${year}`;
    return `Vol. ${vol} · ${year}`;
  }

  function langBrandName() {
    const lang = window.BSi18n?.getLanguage?.() || CFG.defaultLanguage || "ru";
    if (lang === "ru") return NAME_RU;
    return NAME;
  }

  function brandSubtitle() {
    return (
      CFG.journalSubtitle ||
      CFG.journalSubtitleEn ||
      "An International Journal of Biological Research and Methodology"
    );
  }

  function topLicenseLabel() {
    const license = CFG.license || "CC BY 4.0";
    if (CFG.licenseAppliedToPublishedContent) return license;
    return t("top.license.planned").replace("{license}", license);
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

  document.addEventListener("DOMContentLoaded", () => {
    const saved = (() => {
      try {
        return localStorage.getItem("bs_lang") || CFG.defaultLanguage || "ru";
      } catch {
        return CFG.defaultLanguage || "ru";
      }
    })();
    if (window.BSi18n) window.BSi18n.setLanguage(saved);
    mountShell();
    hydrateConfig();
    hydrateApc();
    bindLanguage();
    window.BSi18n?.setLanguage(saved);
    // Chat/API need python server.py — hide on static GitHub Pages hosts.
    const staticHost = /\.github\.io$/i.test(location.hostname);
    if (CFG.chatEnabled && !staticHost && window.BSChat) window.BSChat.mount();
    // Auth header slot (login.html / account.html load auth.js themselves)
    if (!document.querySelector('script[src*="auth.js"]')) {
      const s = document.createElement("script");
      s.src = "assets/js/auth.js";
      s.defer = true;
      document.body.appendChild(s);
    } else {
      window.BSAuth?.refreshHeaderAuth?.();
    }
  });

  function mountShell() {
    const headerHost = document.getElementById("site-header");
    const footerHost = document.getElementById("site-footer");
    if (headerHost) headerHost.innerHTML = renderHeader();
    if (footerHost) footerHost.innerHTML = renderFooter();
    bindHeader();
  }

  function dropdown(id, labelKey, items) {
    const open = items.some((item) => item.id === PAGE && !item.external);
    const links = items
      .map((item) => {
        const ext = item.external || /^https?:\/\//i.test(item.href || "");
        const target = ext ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${item.href}" class="${!ext && item.id === PAGE ? "is-active" : ""}" data-i18n="${item.labelKey}"${target}>${t(item.labelKey)}</a>`;
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
      { href: "ai-policy.html", id: "ai-policy", labelKey: "nav.editors.ai" },
    ];

    const confLink = CFG.conferenceEnabled
      ? `<a href="conferences.html" class="${PAGE === "conferences" ? "is-active" : ""}" data-i18n="nav.conferences">${t("nav.conferences")}</a>`
      : "";
    const sub = submitTargetAttrs();

    return `
      <div class="topbar">
        <div class="container topbar-inner">
          <div class="topbar-left">
            <span><span data-i18n="top.issn">ISSN</span>: <em data-cfg-issn>${formatIssn()}</em></span>
            <span class="dot" aria-hidden="true"></span>
            <span data-cfg-volume>${volumeLabel()}</span>
            <span class="dot" aria-hidden="true"></span>
            <span data-i18n="top.oa">Open Access</span>
            <span class="dot" aria-hidden="true"></span>
            <span data-i18n="${CFG.licenseAppliedToPublishedContent ? "top.license" : "top.license.planned"}">${topLicenseLabel()}</span>
          </div>
          <div class="topbar-right">
            <span class="lang" role="group" aria-label="${t("lang.hint")}">
              <a href="#" data-lang="en" aria-label="English">EN</a>
              <a href="#" data-lang="ru" aria-label="Русский">RU</a>
              <a href="#" data-lang="zh" aria-label="中文">中文</a>
            </span>
          </div>
        </div>
      </div>
      <div class="header-bar">
        <div class="container header-inner compact-header">
          <a class="brand" href="index.html" aria-label="${NAME}">
            <span class="brand-text">
              <span class="brand-name">${escapeHtml(langBrandName())}</span>
              <span class="brand-tag">${escapeHtml(brandSubtitle())}</span>
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
    const license = CFG.license || "CC BY 4.0";
    const licenseKey = CFG.licenseAppliedToPublishedContent
      ? "footer.license.applied"
      : "footer.license.planned";
    const licenseLine = t(licenseKey).replace("{license}", license);
    const lang = window.BSi18n?.getLanguage?.() || "ru";
    const tagline =
      lang === "en"
        ? CFG.journalTaglineEn || t("footer.tagline")
        : CFG.journalTaglineRu || t("footer.tagline");

    return `
      <div class="container footer-grid footer-4">
        <div class="footer-brand-block">
          <strong class="footer-brand">${NAME}</strong>
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
          <a href="ai-policy.html">${t("footer.ai")}</a>
          <a href="corrections.html">${t("footer.corrections")}</a>
          <a href="complaints.html">${t("footer.complaints")}</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>© ${year} ${NAME} Editorial Office. ${licenseLine}</p>
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
      el.textContent = val == null || val === "" ? "Информация будет добавлена." : String(val);
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

    const statsNote = document.getElementById("home-stats-note");
    if (statsNote) {
      const hasData = ["articlesCount", "issuesCount", "authorsCount", "editorsCount", "reviewersCount", "countriesCount"].some(
        (key) => Number(CFG[key] || 0) > 0
      );
      statsNote.hidden = hasData;
    }

    hydratePartnersAndFunding();
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

  function bindLanguage() {
    document.querySelectorAll("[data-lang]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = el.getAttribute("data-lang");
        window.BSi18n?.setLanguage(lang);
        try {
          localStorage.setItem("bs_lang", lang);
        } catch {
          /* ignore */
        }
        document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
        mountShell();
        hydrateConfig();
        hydrateApc();
        bindLanguage();
        window.dispatchEvent(new CustomEvent("bs:langchange", { detail: { lang } }));
      });
    });
    document.querySelectorAll("[data-lang]").forEach((el) => {
      const lang = window.BSi18n?.getLanguage?.() || "ru";
      el.classList.toggle("is-active", el.getAttribute("data-lang") === lang);
    });
  }
})();
