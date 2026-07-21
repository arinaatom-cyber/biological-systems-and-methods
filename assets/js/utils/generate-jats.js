/**
 * Runtime port of src/utils/generateJATS.ts (keep in sync).
 * Browser: window.BSJats.generateJATS(article)
 * Node: require / dynamic import via tools/demo_jats.mjs
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BSJats = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function xmlEscape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function splitName(author) {
    if (author.surname || author.givenNames) {
      return { surname: author.surname || "Unknown", given: author.givenNames || "" };
    }
    const full = (author.name || "Unknown Author").trim();
    const parts = full.split(/\s+/);
    if (parts.length === 1) return { surname: parts[0], given: "" };
    return { surname: parts[parts.length - 1], given: parts.slice(0, -1).join(" ") };
  }

  function parseIsoDate(iso) {
    if (!iso) return null;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return { year: m[1], month: m[2], day: m[3] };
  }

  function historyDate(dateType, iso) {
    const d = parseIsoDate(iso);
    if (!d) return "";
    return `      <date date-type="${dateType}">
        <day>${d.day}</day>
        <month>${d.month}</month>
        <year>${d.year}</year>
      </date>`;
  }

  function pubDate(iso, pubType) {
    const d = parseIsoDate(iso);
    if (!d) return "";
    return `      <pub-date pub-type="${pubType || "epub"}">
        <day>${d.day}</day>
        <month>${d.month}</month>
        <year>${d.year}</year>
      </pub-date>`;
  }

  function generateJATS(article, journalFallback) {
    if (!article?.title?.trim()) throw new Error("generateJATS: article.title is required");
    if (!Array.isArray(article.authors) || !article.authors.length) {
      throw new Error("generateJATS: article.authors must be a non-empty array");
    }

    const j = Object.assign({}, journalFallback || {}, article.journal || {});
    const journalTitle = j.title || "Biological Systems and Methods";
    const publisherName = j.publisherName || "Biological Systems and Methods Editorial Office";
    const license = article.license || "CC BY 4.0";
    const licenseUrl = article.licenseUrl || "https://creativecommons.org/licenses/by/4.0/";
    const lang = (article.language || "en").slice(0, 2);
    const articleType = article.articleType || "research-article";

    const issnBlock = [
      j.issn ? `      <issn publication-format="print">${xmlEscape(j.issn)}</issn>` : "",
      j.eissn ? `      <issn publication-format="electronic">${xmlEscape(j.eissn)}</issn>` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const affiliations = article.affiliations || [];

    const contribs = article.authors
      .map((author) => {
        const { surname, given } = splitName(author);
        const affXref = (author.aff || [])
          .map((id) => `        <xref ref-type="aff" rid="aff${xmlEscape(id)}"/>`)
          .join("\n");
        const orcid = author.orcid
          ? `        <contrib-id contrib-id-type="orcid">https://orcid.org/${xmlEscape(
              String(author.orcid).replace(/^https?:\/\/orcid\.org\//i, "")
            )}</contrib-id>`
          : "";
        const email = author.email ? `        <email>${xmlEscape(author.email)}</email>` : "";
        const corr = author.corresponding ? ` corresp="yes"` : "";
        return `      <contrib contrib-type="author"${corr}>
${orcid}
        <name>
          <surname>${xmlEscape(surname)}</surname>
          ${given ? `<given-names>${xmlEscape(given)}</given-names>` : ""}
        </name>
${email}
${affXref}
      </contrib>`;
      })
      .join("\n");

    const affXml = affiliations
      .map((a) => {
        const ror = a.rorId
          ? `        <institution-id institution-id-type="ror">https://ror.org/${xmlEscape(
              String(a.rorId).replace(/^https?:\/\/ror\.org\//i, "")
            )}</institution-id>`
          : "";
        const country = a.country ? `        <country>${xmlEscape(a.country)}</country>` : "";
        return `      <aff id="aff${xmlEscape(a.id)}">
        <institution content-type="orgname">${xmlEscape(a.name)}</institution>
${ror}
${country}
      </aff>`;
      })
      .join("\n");

    const history = [
      historyDate("received", article.received),
      historyDate("rev-recd", article.revised),
      historyDate("accepted", article.accepted),
    ]
      .filter(Boolean)
      .join("\n");

    const kwd = article.keywords?.length
      ? `      <kwd-group kwd-group-type="author">
${article.keywords.map((k) => `        <kwd>${xmlEscape(k)}</kwd>`).join("\n")}
      </kwd-group>`
      : "";

    const funding = article.funding?.length
      ? `      <funding-group>
${article.funding
  .map(
    (f) => `        <award-group>
          <funding-source>${xmlEscape(f.funderName)}</funding-source>
          ${f.awardId ? `<award-id>${xmlEscape(f.awardId)}</award-id>` : ""}
        </award-group>`
  )
  .join("\n")}
      </funding-group>`
      : "";

    const selfUri = [
      article.htmlUrl
        ? `      <self-uri content-type="html" xlink:href="${xmlEscape(article.htmlUrl)}"/>`
        : "",
      article.pdfUrl
        ? `      <self-uri content-type="pdf" xlink:href="${xmlEscape(article.pdfUrl)}"/>`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const dataIds = (article.dataIdentifiers || []).filter(Boolean);
    const dataNotes = [
      article.dataAvailability
        ? `      <custom-meta>
        <meta-name>data-availability</meta-name>
        <meta-value>${xmlEscape(article.dataAvailability)}</meta-value>
      </custom-meta>`
        : "",
      ...dataIds.map(
        (href) => `      <custom-meta>
        <meta-name>data-identifier</meta-name>
        <meta-value xlink:href="${xmlEscape(href)}">${xmlEscape(href)}</meta-value>
      </custom-meta>`
      ),
    ]
      .filter(Boolean)
      .join("\n");

    const sections = article.sections?.length
      ? article.sections
          .map((sec, i) => {
            const sid = sec.id || `sec${i + 1}`;
            const paras = (sec.paragraphs || [])
              .map((p) => `        <p>${xmlEscape(p)}</p>`)
              .join("\n");
            return `    <sec id="${xmlEscape(sid)}">
      <title>${xmlEscape(sec.title)}</title>
${paras}
    </sec>`;
          })
          .join("\n")
      : `    <sec id="body">
      <title>Body</title>
      <p>Full text not supplied for this deposit package.</p>
    </sec>`;

    const supp = article.supplementary?.length
      ? `    <sec sec-type="supplementary-material">
      <title>Supplementary material</title>
${article.supplementary
  .map(
    (s, i) => `      <supplementary-material id="${xmlEscape(s.id || `supp${i + 1}`)}" xlink:href="${xmlEscape(s.href)}">
        <label>${xmlEscape(s.label || `Supplementary file ${i + 1}`)}</label>
        ${s.title ? `<caption><title>${xmlEscape(s.title)}</title></caption>` : ""}
      </supplementary-material>`
  )
  .join("\n")}
    </sec>`
      : "";

    const doiLine = article.doi
      ? `      <article-id pub-id-type="doi">${xmlEscape(article.doi)}</article-id>`
      : "";
    const artNum = article.articleNumber || article.id;
    const artNumLine = artNum
      ? `      <article-id pub-id-type="publisher-id">${xmlEscape(artNum)}</article-id>`
      : "";
    const vol =
      article.volume != null && article.volume !== ""
        ? `      <volume>${xmlEscape(article.volume)}</volume>`
        : "";
    const iss =
      article.issue != null && article.issue !== ""
        ? `      <issue>${xmlEscape(article.issue)}</issue>`
        : "";
    const fpage = article.fpage ? `      <fpage>${xmlEscape(article.fpage)}</fpage>` : "";
    const lpage = article.lpage ? `      <lpage>${xmlEscape(article.lpage)}</lpage>` : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE article PUBLIC "-//NLM//DTD JATS (Z39.96) Journal Publishing DTD v1.2 20190208//EN" "https://jats.nlm.nih.gov/publishing/1.2/JATS-journalpublishing1-2.dtd">
<article xmlns:xlink="http://www.w3.org/1999/xlink" article-type="${xmlEscape(articleType)}" dtd-version="1.2" xml:lang="${xmlEscape(lang)}">
  <front>
    <journal-meta>
      <journal-id journal-id-type="publisher-id">${xmlEscape(journalTitle.replace(/\s+/g, "-").toLowerCase())}</journal-id>
      <journal-title-group>
        <journal-title>${xmlEscape(journalTitle)}</journal-title>
      </journal-title-group>
${issnBlock}
      <publisher>
        <publisher-name>${xmlEscape(publisherName)}</publisher-name>
        ${j.publisherType ? `<publisher-loc>${xmlEscape(j.publisherType)}</publisher-loc>` : ""}
      </publisher>
    </journal-meta>
    <article-meta>
${doiLine}
${artNumLine}
      <title-group>
        <article-title>${xmlEscape(article.title)}</article-title>
      </title-group>
      <contrib-group>
${contribs}
      </contrib-group>
${affXml}
${history ? `      <history>\n${history}\n      </history>` : ""}
${pubDate(article.published || article.accepted)}
${vol}
${iss}
${fpage}
${lpage}
      <permissions>
        <copyright-statement>© The Author(s). Published under ${xmlEscape(license)}.</copyright-statement>
        <license license-type="open-access" xlink:href="${xmlEscape(licenseUrl)}">
          <license-p>This is an open-access article distributed under the terms of the Creative Commons Attribution License (CC BY 4.0).</license-p>
        </license>
      </permissions>
${selfUri}
      <abstract>
        <p>${xmlEscape(article.abstract || "")}</p>
      </abstract>
${kwd}
${funding}
${dataNotes ? `      <custom-meta-group>\n${dataNotes}\n      </custom-meta-group>` : ""}
    </article-meta>
  </front>
  <body>
${sections}
${supp}
  </body>
</article>
`.replace(/\n{3,}/g, "\n\n");
  }

  const DUMMY_JATS_ARTICLE = {
    id: "MS-DUMMY-0001",
    articleNumber: "e0001",
    doi: "",
    title: "Dummy molecular assay validation for JATS deposit testing in Biological Systems and Methods",
    abstract:
      "This is a synthetic abstract used only to verify JATS XML generation for Crossref and PMC workflows. It must never appear in the public articles index.",
    keywords: ["JATS", "Crossref", "molecular sciences", "open access", "reproducibility"],
    language: "en",
    articleType: "research-article",
    volume: 1,
    issue: 1,
    fpage: "1",
    lpage: "12",
    received: "2026-01-10",
    revised: "2026-02-01",
    accepted: "2026-02-15",
    published: "2026-03-01",
    license: "CC BY 4.0",
    pdfUrl: "https://example.org/articles/MS-DUMMY-0001.pdf",
    htmlUrl: "https://example.org/article.html?id=MS-DUMMY-0001",
    authors: [
      {
        givenNames: "Anna",
        surname: "Ivanova",
        orcid: "0000-0002-1825-0097",
        email: "anna.ivanova@example.org",
        corresponding: true,
        aff: [1],
      },
      {
        givenNames: "Wei",
        surname: "Chen",
        orcid: "0000-0001-5109-3700",
        aff: [1, 2],
      },
    ],
    affiliations: [
      {
        id: 1,
        name: "Institute of Molecular Systems, Example University",
        rorId: "https://ror.org/00aaaaa00",
        country: "RU",
      },
      {
        id: 2,
        name: "Department of Chemical Biology, Example Institute",
        rorId: "https://ror.org/00bbbbb00",
        country: "CN",
      },
    ],
    funding: [
      { funderName: "Russian Science Foundation", awardId: "RSF-00-00000" },
      { funderName: "National Natural Science Foundation of China", awardId: "NSFC-00000000" },
    ],
    sections: [
      {
        id: "intro",
        title: "Introduction",
        paragraphs: [
          "This dummy article exists solely to exercise the JATS generator before real content is available.",
        ],
      },
      {
        id: "methods",
        title: "Methods",
        paragraphs: ["No experimental procedures were performed. Structured metadata only."],
      },
      {
        id: "results",
        title: "Results",
        paragraphs: ["Generator output should validate against JATS 1.2 Publishing DTD."],
      },
    ],
    dataAvailability:
      "Dummy datasets are not deposited; replace with FAIR repository links on publish.",
    dataIdentifiers: [
      "https://example.com/dataset-placeholder",
      "https://github.com/example/molsciera-dummy",
    ],
    supplementary: [
      {
        id: "supp1",
        label: "Supplementary Table S1",
        href: "https://example.org/articles/MS-DUMMY-0001/supp1.xlsx",
        title: "Assay parameters (dummy)",
      },
    ],
    journal: {
      title: "Biological Systems and Methods",
      issn: null,
      eissn: null,
      publisherName: null,
      publisherType: "ANO + LLC",
    },
  };

  return { generateJATS, DUMMY_JATS_ARTICLE };
});
