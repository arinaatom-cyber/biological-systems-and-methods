(() => {
  const homeIssues = document.getElementById("home-issues");
  const issuesList = document.getElementById("issues-list");
  const homeConference = document.getElementById("home-conference");
  const conferenceList = document.getElementById("conference-list");
  const conferenceEmpty = document.getElementById("conference-empty");
  const CFG = window.BS_CONFIG || {};

  if (!homeIssues && !issuesList && !homeConference && !conferenceList) return;

  let issuesMeta = [];
  let conferencesMeta = [];

  init();
  window.addEventListener("bs:langchange", renderAll);

  async function init() {
    const [issues, conferences] = await Promise.all([
      loadJson("data/issues.json"),
      loadJson("data/conferences.json"),
    ]);
    issuesMeta = issues.length ? issues : CFG.plannedIssues || [];
    conferencesMeta = conferences;
    renderAll();
  }

  function t(key) {
    return window.BSi18n?.t(key) || key;
  }

  function renderAll() {
    if (homeIssues) renderIssues(homeIssues, issuesMeta);
    if (issuesList) renderIssues(issuesList, issuesMeta, true);

    if (!CFG.conferenceEnabled) {
      if (homeConference) homeConference.hidden = true;
      if (conferenceList) {
        conferenceList.hidden = true;
        conferenceList.innerHTML = "";
      }
      if (conferenceEmpty) conferenceEmpty.hidden = false;
      return;
    }

    if (homeConference && conferencesMeta[0]) {
      homeConference.hidden = false;
      homeConference.innerHTML = conferenceCard(conferencesMeta[0], true);
    }
    if (conferenceList) {
      if (!conferencesMeta.length) {
        conferenceList.hidden = true;
        if (conferenceEmpty) conferenceEmpty.hidden = false;
      } else {
        if (conferenceEmpty) conferenceEmpty.hidden = true;
        conferenceList.hidden = false;
        conferenceList.innerHTML = conferencesMeta.map((c) => conferenceCard(c, false)).join("");
      }
    }
  }

  async function loadJson(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("load failed");
      return await res.json();
    } catch {
      return [];
    }
  }

  function renderIssues(target, issues, detailed = false) {
    if (!issues.length) {
      target.innerHTML = `<p class="empty-state">${escapeHtml(t("issues.empty"))}</p>`;
      return;
    }
    target.innerHTML = issues
      .map((issue) => {
        const n = issue.issue;
        const tags = [1, 2, 3, 4]
          .map((i) => {
            const key = `issue.${n}.f${i}`;
            const label = t(key);
            if (!label || label === key) return "";
            return `<span class="issue-tag">${escapeHtml(label)}</span>`;
          })
          .join("");
        return `
          <article class="issue-card issue-type-${n}">
            <div class="issue-card-top">
              <span class="issue-cover">${escapeHtml(t(`issue.${n}.theme`) || issue.coverLabel || `Vol. 1 · No. ${n}`)}</span>
              <span class="issue-status">${escapeHtml(t("issue.status.open"))}</span>
            </div>
            <h3>${escapeHtml(t(`issue.${n}.title`))}</h3>
            <p class="issue-summary">${escapeHtml(t(`issue.${n}.summary`))}</p>
            <div class="issue-tags">${tags}</div>
            ${
              detailed
                ? `<a class="btn btn-ghost btn-sm" href="articles.html">${escapeHtml(t("issues.viewArticles"))}</a>`
                : ""
            }
          </article>`;
      })
      .join("");
  }

  function conferenceCard(conf, compact) {
    return `
      <article class="conference-card">
        <div class="issue-card-top">
          <span class="issue-cover">${escapeHtml(conf.format || "")}</span>
          <span class="issue-status">${escapeHtml(conf.status || "")}</span>
        </div>
        <h3>${escapeHtml(conf.title || "")}</h3>
        <p class="issue-theme">${escapeHtml(conf.dates || "")}</p>
        <p class="issue-summary">${escapeHtml(conf.description || "")}</p>
        ${
          compact
            ? `<a class="btn btn-secondary btn-sm" href="conferences.html">Details</a>`
            : ""
        }
      </article>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
})();
