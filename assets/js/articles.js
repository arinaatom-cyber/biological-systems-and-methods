(() => {
  const listEl = document.getElementById("articles-list");
  const filtersEl = document.getElementById("article-filters");
  const homeList = document.getElementById("home-articles");
  const homeEmpty = document.getElementById("home-articles-empty");
  const searchForm = document.getElementById("article-search");
  const noneEl = document.getElementById("articles-none");
  if (!listEl && !homeList) return;

  let articles = [];
  let active = "all";
  let query = {
    q: "",
    type: "",
    year: "",
    issue: "",
    section: "",
    language: "",
    openData: "",
    hasCode: "",
    negative: "",
    registered: "",
  };

  init();
  window.addEventListener("bs:langchange", () => {
    if (filtersEl) buildFilters();
    paint();
  });

  async function init() {
    const params = new URLSearchParams(location.search);
    if (params.get("type")) {
      query.type = params.get("type");
      active = params.get("type");
    }
    try {
      const res = await fetch("data/articles.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load articles");
      articles = await res.json();
    } catch {
      articles = [];
    }
    if (listEl) buildFilters();
    bindSearch();
    paint();
  }

  function t(key) {
    return window.BSi18n?.t(key) || key;
  }

  function lang() {
    return window.BSi18n?.getLanguage?.() || "ru";
  }

  function filtered() {
    return articles.filter((a) => {
      if (active !== "all" && a.section !== active && a.typeSlug !== active && a.type !== active) return false;
      if (query.type && a.typeSlug !== query.type && a.type !== query.type) return false;
      if (query.year && String(a.year || a.date?.slice(0, 4)) !== String(query.year)) return false;
      if (query.issue && String(a.issue) !== String(query.issue)) return false;
      if (query.section && a.section !== query.section) return false;
      if (query.language && a.language !== query.language) return false;
      if (query.openData === "1" && !a.openData) return false;
      if (query.hasCode === "1" && !a.hasCode) return false;
      if (query.negative === "1" && !/negative|null/i.test(a.type || "")) return false;
      if (query.registered === "1" && !/registered/i.test(a.type || "")) return false;
      if (query.q) {
        const hay = [a.title, ...(a.authors || []), ...(a.keywords || []), a.abstract]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query.q.toLowerCase())) return false;
      }
      return true;
    });
  }

  function paint() {
    const items = filtered();
    if (homeList) {
      if (!articles.length) {
        homeList.innerHTML = "";
        if (homeEmpty) homeEmpty.hidden = false;
      } else {
        if (homeEmpty) homeEmpty.hidden = true;
        renderList(homeList, articles.slice(0, 3));
      }
    }
    if (listEl) {
      if (!articles.length) {
        listEl.innerHTML = "";
        const emptyHost = document.getElementById("articles-empty");
        if (emptyHost) {
          emptyHost.hidden = false;
          emptyHost.innerHTML = `
            <div class="empty-state">
              <p>${escapeHtml(t("articles.empty.full"))}</p>
              <div class="cta-row">
                <a class="btn btn-primary" href="${escapeHtml(window.BS?.submitHref?.() || "submit.html")}">${escapeHtml(t("nav.submit"))}</a>
                <a class="btn btn-ghost" href="article-types.html">${escapeHtml(t("home.articles.types"))}</a>
              </div>
              <div class="skeleton-grid" aria-hidden="true">
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
              </div>
            </div>`;
        } else {
          listEl.innerHTML = `<li class="article-item"><div class="empty-state"><p>${escapeHtml(t("articles.empty"))}</p></div></li>`;
        }
        if (noneEl) noneEl.hidden = true;
      } else if (!items.length) {
        listEl.innerHTML = "";
        if (noneEl) {
          noneEl.hidden = false;
          noneEl.textContent = t("articles.noneFound");
        }
      } else {
        if (noneEl) noneEl.hidden = true;
        const emptyHost = document.getElementById("articles-empty");
        if (emptyHost) emptyHost.hidden = true;
        renderList(listEl, items);
      }
    }
  }

  function bindSearch() {
    if (!searchForm) return;
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(searchForm);
      query.q = String(fd.get("q") || "");
      query.year = String(fd.get("year") || "");
      query.issue = String(fd.get("issue") || "");
      query.type = String(fd.get("type") || "");
      query.section = String(fd.get("section") || "");
      query.language = String(fd.get("language") || "");
      query.openData = fd.get("openData") ? "1" : "";
      query.hasCode = fd.get("hasCode") ? "1" : "";
      query.negative = fd.get("negative") ? "1" : "";
      query.registered = fd.get("registered") ? "1" : "";
      paint();
    });
  }

  function buildFilters() {
    if (!filtersEl) return;
    const sections = ["all", ...new Set(articles.map((a) => a.section).filter(Boolean))];
    filtersEl.innerHTML = sections
      .map(
        (section) =>
          `<button type="button" class="filter-btn ${section === active ? "is-active" : ""}" data-filter="${section}">${
            section === "all" ? escapeHtml(t("articles.allSections")) : escapeHtml(section)
          }</button>`
      )
      .join("");

    filtersEl.onclick = (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;
      active = btn.dataset.filter;
      filtersEl.querySelectorAll(".filter-btn").forEach((el) => el.classList.toggle("is-active", el === btn));
      paint();
    };
  }

  function renderList(target, items) {
    if (!items.length) {
      target.innerHTML = `<li class="article-item"><p class="article-abstract">${escapeHtml(t("articles.empty"))}</p></li>`;
      return;
    }

    const locale = lang() === "zh" ? "zh-CN" : lang() === "ru" ? "ru-RU" : "en-GB";

    target.innerHTML = items
      .map((article) => {
        const date = article.date
          ? new Date(article.date).toLocaleDateString(locale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";
        const volLabel =
          lang() === "ru"
            ? `Том ${article.volume} · Вып. ${article.issue}`
            : lang() === "zh"
              ? `第 ${article.volume} 卷 · 第 ${article.issue} 期`
              : `Vol. ${article.volume} · Issue ${article.issue}`;
        return `
          <li class="article-item" id="${escapeHtml(article.id)}">
            <div class="article-meta">
              <span class="section-tag">${escapeHtml(article.section || "")}</span>
              <span>${escapeHtml(article.type || "")}</span>
              <span>${escapeHtml(volLabel)}</span>
              ${date ? `<span>${date}</span>` : ""}
              <span>${escapeHtml(t("articles.openAccess"))}</span>
            </div>
            <h3><a href="article.html?id=${encodeURIComponent(article.id)}">${escapeHtml(article.title)}</a></h3>
            <p class="article-authors">${escapeHtml((article.authors || []).join(", "))}</p>
            <p class="article-abstract">${escapeHtml(article.abstract || "")}</p>
          </li>`;
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
})();
