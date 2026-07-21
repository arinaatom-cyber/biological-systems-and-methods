(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const CFG = window.BS_CONFIG || {};
    const stats = CFG.boardStats || {};
    const host = document.getElementById("board-stats");
    if (host) {
      host.innerHTML = `
        <div class="stat-cell"><span>Главный редактор</span><strong>${stats.editorInChief ?? 0}</strong></div>
        <div class="stat-cell"><span>Научные редакторы</span><strong>${stats.scientificEditors ?? 0}</strong></div>
        <div class="stat-cell"><span>Редакторы разделов</span><strong>${stats.sectionEditors ?? 0}</strong></div>
        <div class="stat-cell"><span>Статистические редакторы</span><strong>${stats.statisticalEditors ?? 0}</strong></div>
        <div class="stat-cell"><span>Редакторы по данным</span><strong>${stats.dataEditors ?? 0}</strong></div>`;
    }

    fetch("data/editors.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((editors) => {
        const list = document.getElementById("editors-list");
        if (!list || !editors.length) return;
        list.hidden = false;
        list.innerHTML = editors
          .map(
            (e) => `
          <article class="editor-card">
            <h3>${escape(e.name || "")}</h3>
            <p>${escape(e.role || "")}${e.section ? " · " + escape(e.section) : ""}</p>
            <p>${escape(e.affiliation || "")}${e.country ? ", " + escape(e.country) : ""}</p>
            ${e.orcid ? `<p>ORCID: ${escape(e.orcid)}</p>` : ""}
          </article>`
          )
          .join("");
      })
      .catch(() => {});
  });

  function escape(v) {
    return String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
})();
