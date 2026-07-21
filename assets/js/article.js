(() => {
  const root = document.getElementById("article-root");
  if (!root) return;

  const CITATION_META_ATTR = "data-citation-meta";
  const lightbox = document.getElementById("art-lightbox");
  const lightboxBody = document.getElementById("art-lightbox-body");
  const lightboxClose = document.getElementById("art-lightbox-close");
  const CFG = () => window.BS_CONFIG || {};
  const journalName = () => CFG().journalName || "Biological Systems and Methods";

  init();

  async function init() {
    clearCitationMetas();
    const id = new URLSearchParams(location.search).get("id") || location.hash.slice(1);
    if (!id) {
      root.innerHTML = `<p class="art-missing">Select an article from the <a href="articles.html">articles list</a>.</p>`;
      return;
    }

    const [metaList, bodies] = await Promise.all([
      loadJson("data/articles.json"),
      loadJson("data/article-bodies.json"),
    ]);
    const meta = Array.isArray(metaList) ? metaList.find((a) => a && a.id === id) : null;
    if (!meta || !meta.title) {
      root.innerHTML = `<p class="art-missing">Article not found. <a href="articles.html">Back to list</a>.</p>`;
      return;
    }

    const body = bodies[id] || null;
    document.title = `${meta.title} — ${journalName()}`;
    injectCitationMetas(meta, body);
    root.setAttribute("aria-busy", "false");
    root.innerHTML = renderArticle(meta, body);
    bindFigures();
    bindLightbox();
  }

  async function loadJson(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("fail");
      return await res.json();
    } catch {
      return path.includes("articles.json") ? [] : {};
    }
  }

  /** Google Scholar Highwire Press tags — only for real resolved articles */
  function injectCitationMetas(meta, body) {
    clearCitationMetas();
    const authors = normalizeAuthors(meta, body);
    const published = body?.published || meta.date || meta.published || "";
    const absUrl = absoluteUrl(`article.html?id=${encodeURIComponent(meta.id)}`);
    const pdfUrl = meta.pdfUrl || meta.pdf || body?.pdfUrl || "";
    const issn = CFG().issn || CFG().eissn || meta.issn || null;

    const tags = [
      ["citation_title", meta.title],
      ...authors.map((a) => ["citation_author", a.name]),
      ["citation_publication_date", toScholarDate(published)],
      ["citation_journal_title", journalName()],
      issn ? ["citation_issn", issn] : null,
      meta.volume != null && meta.volume !== "" ? ["citation_volume", String(meta.volume)] : null,
      meta.issue != null && meta.issue !== "" ? ["citation_issue", String(meta.issue)] : null,
      meta.doi ? ["citation_doi", meta.doi] : null,
      pdfUrl ? ["citation_pdf_url", absoluteUrl(pdfUrl)] : null,
      ["citation_abstract_html_url", absUrl],
    ].filter(Boolean);

    tags.forEach(([name, content]) => {
      if (!content) return;
      const el = document.createElement("meta");
      el.setAttribute("name", name);
      el.setAttribute("content", content);
      el.setAttribute(CITATION_META_ATTR, "1");
      document.head.appendChild(el);
    });
  }

  function clearCitationMetas() {
    document.querySelectorAll(`meta[${CITATION_META_ATTR}]`).forEach((el) => el.remove());
  }

  function toScholarDate(iso) {
    if (!iso) return "";
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}/${mo}/${day}`;
  }

  function absoluteUrl(pathOrUrl) {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    try {
      return new URL(pathOrUrl, location.origin + location.pathname.replace(/[^/]+$/, "")).href;
    } catch {
      return pathOrUrl;
    }
  }

  function normalizeAuthors(meta, body) {
    if (body?.authorDetails?.length) {
      return body.authorDetails.map((a) => ({
        name: a.name,
        aff: a.aff || [],
        corresponding: Boolean(a.corresponding),
        email: a.email,
        orcid: a.orcid || null,
      }));
    }
    const list = meta.authors || [];
    return list.map((a) =>
      typeof a === "string"
        ? { name: a, aff: [1], orcid: null }
        : {
            name: a.name,
            aff: a.aff || [1],
            corresponding: a.corresponding,
            email: a.email,
            orcid: a.orcid || null,
          }
    );
  }

  function articleHistoryHtml(meta, body) {
    const fmt = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";
    const rows = [
      ["Received", body?.received || meta.received],
      ["Revised", body?.revised || meta.revised],
      ["Accepted", body?.accepted || meta.accepted],
      ["Published", body?.published || meta.published || meta.date],
    ]
      .map(([label, value]) => (value ? `<li><span>${label}</span> <time datetime="${escapeAttr(value)}">${escapeHtml(fmt(value))}</time></li>` : ""))
      .filter(Boolean);

    if (!rows.length) return "";
    return `
      <aside class="art-history" aria-label="Article history">
        <h2 class="art-history-title">Article history</h2>
        <ul class="art-history-list">${rows.join("")}</ul>
      </aside>`;
  }

  function renderArticle(meta, body) {
    const isNeg = /negative/i.test(meta.type || "") || meta.issue === 3;
    const authors = normalizeAuthors(meta, body);
    const affiliations =
      body?.affiliations ||
      [{ id: 1, name: "Affiliation details available in the published PDF version." }];

    const authorLine = authors
      .map((a, i) => {
        const aff = (a.aff || []).map((n) => `<sup>${n}</sup>`).join("");
        const star = a.corresponding ? `<sup>*</sup>` : "";
        const orcid = a.orcid
          ? ` <a class="art-orcid" href="https://orcid.org/${escapeAttr(String(a.orcid).replace(/^https?:\/\/orcid\.org\//, ""))}" target="_blank" rel="noopener" aria-label="ORCID">ORCID</a>`
          : "";
        return `${escapeHtml(a.name)}${aff}${star}${orcid}${i < authors.length - 1 ? ", " : ""}`;
      })
      .join("");

    const affLines = affiliations
      .map((a) => `<div><sup>${a.id}</sup> ${escapeHtml(a.name)}</div>`)
      .join("");

    const corr = authors.find((a) => a.corresponding);
    const abstract = meta.abstract || body?.abstract || "";
    const keywords = body?.keywords || meta.keywords || [];
    const history = articleHistoryHtml(meta, body);
    const doi = meta.doi
      ? `<a class="art-doi" href="https://doi.org/${escapeAttr(meta.doi)}" target="_blank" rel="noopener">DOI: ${escapeHtml(meta.doi)}</a>`
      : `<span class="art-doi is-pending">DOI: —</span>`;
    const pdfUrl = meta.pdfUrl || meta.pdf || body?.pdfUrl || "";
    const htmlUrl = meta.htmlUrl || `article.html?id=${encodeURIComponent(meta.id)}`;
    const formats = `
      <p class="art-formats">
        <a class="btn btn-ghost btn-sm" href="${escapeAttr(htmlUrl)}">HTML</a>
        ${
          pdfUrl
            ? `<a class="btn btn-ghost btn-sm" href="${escapeAttr(pdfUrl)}" target="_blank" rel="noopener">PDF</a>`
            : `<span class="btn btn-ghost btn-sm" aria-disabled="true">PDF —</span>`
        }
      </p>`;
    const license = CFG().license || "CC BY 4.0";
    const licenseApplied = CFG().licenseAppliedToPublishedContent;
    const licenseLine = licenseApplied
      ? `Content licensed under ${escapeHtml(license)}.`
      : `Planned open-access licence: ${escapeHtml(license)}.`;
    const funding =
      body?.funding || meta.funding || (CFG().fundingInfo?.length ? CFG().fundingInfo.map((f) => f.funderName).join("; ") : "");
    const dataAvail = body?.dataAvailability || meta.dataAvailability || "";
    const codeAvail = body?.codeAvailability || meta.codeAvailability || "";
    const metaBlocks = `
      <aside class="art-sidecar" aria-label="Article metadata">
        <h2>Publication details</h2>
        <ul>
          <li><strong>Licence.</strong> ${licenseLine}</li>
          ${funding ? `<li><strong>Funding.</strong> ${escapeHtml(funding)}</li>` : "<li><strong>Funding.</strong> —</li>"}
          ${dataAvail ? `<li><strong>Data availability.</strong> ${escapeHtml(dataAvail)}</li>` : "<li><strong>Data availability.</strong> —</li>"}
          ${codeAvail ? `<li><strong>Code availability.</strong> ${escapeHtml(codeAvail)}</li>` : "<li><strong>Code availability.</strong> —</li>"}
        </ul>
      </aside>`;

    let sectionsHtml = "";
    let figuresInserted = false;

    if (body?.sections?.length) {
      sectionsHtml = body.sections
        .map((sec, idx) => {
          let paras = sec.paragraphs
            .map((p) => `<p>${linkCitations(p, body.references)}</p>`)
            .join("");
          let fig = "";
          if (!figuresInserted && idx === 1 && body.figures?.length) {
            fig = body.figures.map((f) => figureHtml(f)).join("");
            figuresInserted = true;
          }
          return `
            <section class="art-section ${sec.fullWidth ? "is-full" : ""}" id="${escapeAttr(sec.id)}">
              <h2>${escapeHtml(sec.title)}</h2>
              ${paras}
              ${fig}
            </section>`;
        })
        .join("");
      if (!figuresInserted && body.figures?.length) {
        sectionsHtml += body.figures.map((f) => `<div class="art-columns">${figureHtml(f)}</div>`).join("");
      }
    } else {
      sectionsHtml = `
        <section class="art-section is-full">
          <h2>FULL TEXT</h2>
          <p class="art-missing" style="padding:0">HTML full text for this article will appear after production typesetting.</p>
        </section>`;
    }

    const refs = body?.references?.length
      ? `<section class="art-refs" id="references">
          <h2>References</h2>
          <ol>
            ${body.references
              .map(
                (r) =>
                  `<li id="ref-${r.id}">${formatRef(r.text)} ${
                    r.doi
                      ? `<a href="https://doi.org/${escapeAttr(r.doi)}" target="_blank" rel="noopener">https://doi.org/${escapeHtml(r.doi)}</a>`
                      : ""
                  }</li>`
              )
              .join("")}
          </ol>
        </section>`
      : "";

    const volIss =
      meta.volume != null
        ? `${escapeHtml(journalName())} ${escapeHtml(meta.volume)}${
            meta.issue != null ? `(${escapeHtml(meta.issue)})` : ""
          }${meta.pages ? `: ${escapeHtml(meta.pages)}` : ""}`
        : "";

    return `
      <header class="art-header">
        <span class="art-type ${isNeg ? "is-negative" : ""}">${escapeHtml(meta.type || "Article")}</span>
        ${
          isNeg
            ? `<p class="art-neg-marker">Negative Results issue · null / unexpected findings</p>`
            : ""
        }
        <h1 class="art-title">${escapeHtml(meta.title)}</h1>
        <p class="art-authors">${authorLine}</p>
        <div class="art-aff">${affLines}</div>
        <p class="art-meta">
          ${corr ? `<em>Correspondence to:</em> ${escapeHtml(corr.name)}${corr.email ? `, <a href="mailto:${escapeAttr(corr.email)}">${escapeHtml(corr.email)}</a>` : ""} · ` : ""}
          ${doi}
          ${volIss ? ` · ${volIss}` : ""}
        </p>
        ${history}
        ${formats}
        <div class="art-badges">
          ${
            body?.aiAssisted
              ? `<a class="art-ai-badge" href="ai-policy.html">AI use disclosed</a>`
              : ""
          }
          <span class="art-ai-badge" style="border-style:dashed">${escapeHtml(meta.section || meta.type || "Article")} · OA</span>
        </div>
      </header>

      <div class="art-abstract-block">
        <h2>Abstract</h2>
        <p>${escapeHtml(abstract || "—")}</p>
        ${
          keywords.length
            ? `<p class="art-keywords"><span class="art-keywords-label">Keywords</span><br>${escapeHtml(
                Array.isArray(keywords) ? keywords.join("; ") : String(keywords)
              )}</p>`
            : ""
        }
      </div>

      ${metaBlocks}

      <div class="art-columns">
        ${sectionsHtml}
        ${refs}
      </div>
    `;
  }

  function figureHtml(fig) {
    return `
      <figure class="art-figure" data-fig="${escapeAttr(fig.id)}">
        <div class="art-figure-frame" tabindex="0" role="button" aria-label="Open figure ${escapeAttr(fig.label)}">
          ${escapeHtml(fig.placeholder || "Figure")}
        </div>
        <div class="art-figure-actions">
          <button type="button" data-lightbox>Open fullscreen</button>
          <button type="button" data-download>Download high-res (demo)</button>
        </div>
        <figcaption class="art-figcap"><strong>${escapeHtml(fig.label)}</strong> ${escapeHtml(fig.caption)}</figcaption>
      </figure>`;
  }

  function linkCitations(text, references = []) {
    const tipMap = Object.fromEntries(
      (references || []).map((r) => [String(r.id), `${r.text}${r.doi ? " DOI: " + r.doi : ""}`])
    );
    let html = escapeHtml(text);
    html = html.replace(/\[(\d+(?:\s*[-–,]\s*\d+)*)\]/g, (_, nums) => {
      const parts = nums.split(/\s*[,]\s*|\s*[-–]\s*/);
      const tips = parts
        .map((n) => tipMap[n.trim()])
        .filter(Boolean)
        .join(" · ");
      return `<button type="button" class="art-cite" data-tip="${escapeAttr(tips || "Reference")}">[${escapeHtml(nums)}]</button>`;
    });
    return html;
  }

  function formatRef(text) {
    const m = text.match(/^(.*?)(\.\s)([^.]+?)(\s\d+)/);
    if (!m) return escapeHtml(text);
    return `${escapeHtml(m[1])}${m[2]}<em>${escapeHtml(m[3])}</em>${escapeHtml(m[4] + text.slice(m[0].length))}`;
  }

  function bindFigures() {
    root.querySelectorAll(".art-figure").forEach((fig) => {
      const frame = fig.querySelector(".art-figure-frame");
      const open = () => openLightbox(fig);
      frame?.addEventListener("click", open);
      frame?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
      fig.querySelector("[data-lightbox]")?.addEventListener("click", open);
      fig.querySelector("[data-download]")?.addEventListener("click", () => {
        const cap = fig.querySelector(".art-figcap")?.textContent || "figure";
        const blob = new Blob([`${journalName()} — ${cap}\n(Demo high-res placeholder)\n`], {
          type: "text/plain",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${fig.dataset.fig || "figure"}_highres.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    });
  }

  function openLightbox(fig) {
    if (!lightbox || !lightboxBody) return;
    lightboxBody.innerHTML = fig.innerHTML;
    lightboxBody.querySelectorAll("button").forEach((b) => b.remove());
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function bindLightbox() {
    const close = () => {
      if (!lightbox) return;
      lightbox.hidden = true;
      document.body.style.overflow = "";
    };
    lightboxClose?.addEventListener("click", close);
    lightbox?.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
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
})();
