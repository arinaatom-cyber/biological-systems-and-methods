(() => {
  const SCOPE_KEYS = ["biology", "bioinformatics", "biochemistry", "biophysics", "reproducibility"];

  function t(key) {
    return window.BSi18n?.t(key) || key;
  }

  function paint(root) {
    if (!root) return;
    root.innerHTML = SCOPE_KEYS.map(
      (id) => `
      <article class="scope-card">
        <h3>${escapeHtml(t(`scope.${id}.title`))}</h3>
        <p>${escapeHtml(t(`scope.${id}.body`))}</p>
      </article>`
    ).join("");
  }

  function paintAll() {
    paint(document.getElementById("aims-scope"));
    paint(document.getElementById("home-scope"));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  document.addEventListener("DOMContentLoaded", paintAll);
  window.addEventListener("bs:langchange", paintAll);
})();
