(() => {
  function paint() {
    const root = document.getElementById("publication-steps");
    if (!root) return;
    const CFG = window.BS_CONFIG || {};
    const lang = window.BSi18n?.getLanguage?.() || "ru";
    const pack = window.BSPageI18n || {};
    const steps = pack.processSteps?.[lang] || pack.processSteps?.en || pack.processSteps?.ru || [];
    const doi = pack.processDoi?.[lang] || pack.processDoi?.en || pack.processDoi?.ru || {};
    const last = CFG.doiInfrastructureActive ? doi.active : doi.meta;
    const all = last ? steps.concat([last]) : steps.slice();
    root.innerHTML = all
      .map((s, i) => `<li><span class="step-num">${i + 1}</span> ${escapeHtml(s)}</li>`)
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  document.addEventListener("DOMContentLoaded", paint);
  window.addEventListener("bs:langchange", paint);
})();
