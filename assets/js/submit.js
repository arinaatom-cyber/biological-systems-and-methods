(() => {
  const DRAFT_KEY = "biological_sciences_submission_draft_v2";
  const TOTAL_STEPS = 4;
  const MAX_MAIN_BYTES = 50 * 1024 * 1024;
  const ALLOWED_MAIN = [".pdf", ".doc", ".docx", ".zip", ".tex", ".rtf"];
  const ALLOWED_SUPP = [
    ".pdf",
    ".doc",
    ".docx",
    ".zip",
    ".csv",
    ".xlsx",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
  ];

  const journalName = () => window.BS_CONFIG?.journalName || "Biological Systems and Methods";
  const editorialEmail = () =>
    window.BS_CONFIG?.editorialEmail || "arina.atom@gmail.com";
  const apcAll = () => window.BS?.formatApcAll?.() || "₽75,000 RUB · ¥6,000 CNY";

  const form = document.getElementById("submit-form");
  if (!form) return;

  // OJS handoff: show banner + optional hide of local wizard when mode=ojs
  (() => {
    const cfg = window.BS_CONFIG || {};
    const ojsUrl = cfg.ojsUrl;
    const useOjs = (cfg.submissionMode === "ojs" || cfg.ojsEnabled) && ojsUrl;
    const banner = document.getElementById("ojs-submit-banner");
    const link = document.getElementById("ojs-submit-link");
    if (banner && useOjs) {
      banner.hidden = false;
      if (link) link.href = ojsUrl;
      const pane = document.getElementById("form-section");
      if (pane && cfg.submissionMode === "ojs") {
        pane.hidden = true;
      }
    }
  })();

  const authorsBox = document.getElementById("authors-box");
  const addAuthorBtn = document.getElementById("add-author");
  const fileInput = document.getElementById("manuscript");
  const fileName = document.getElementById("file-name");
  const fileDrop = document.getElementById("file-drop");
  const fileError = document.getElementById("file-error");
  const suppInput = document.getElementById("supplementary");
  const suppName = document.getElementById("supp-name");
  const suppDrop = document.getElementById("supp-drop");
  const formSection = document.getElementById("form-section");
  const receipt = document.getElementById("receipt");
  const receiptMeta = document.getElementById("receipt-meta");
  const deliveryStatus = document.getElementById("delivery-status");
  const draftStatus = document.getElementById("draft-status");
  const stepLabels = [...document.querySelectorAll("[data-step-label]")];
  const panes = [...document.querySelectorAll("[data-step-pane]")];
  const prevBtn = document.getElementById("prev-step");
  const nextBtn = document.getElementById("next-step");
  const submitBtn = document.getElementById("submit-final");
  const saveDraftBtn = document.getElementById("save-draft");
  const clearDraftBtn = document.getElementById("clear-draft");
  const reviewBox = document.getElementById("review-box");
  const downloadPackageBtn = document.getElementById("download-package");
  const downloadFileBtn = document.getElementById("download-file");
  const mailtoLink = document.getElementById("mailto-link");
  const newSubmissionBtn = document.getElementById("new-submission");
  const formError = document.getElementById("form-error");
  const openAckChat = document.getElementById("open-ack-chat");
  const abstractEl = document.getElementById("abstract");
  const abstractCount = document.getElementById("abstract-count");

  let step = 1;
  let lastSubmission = null;
  /** @type {File | null} */
  let selectedFile = null;
  /** @type {File[]} */
  let suppFiles = [];

  init();

  function init() {
    bindAuthors();
    bindFile();
    bindWizard();
    bindDraft();
    abstractEl?.addEventListener("input", updateAbstractCount);
    updateAbstractCount();
    openAckChat?.addEventListener("click", () => window.BSChat?.openAck?.());
    const restored = restoreDraft();
    applyQueryDefaults();
    if (!restored) goTo(1);
    else goTo(step);
  }

  function applyQueryDefaults() {
    const type = new URLSearchParams(location.search).get("type");
    if (type === "invited") {
      setValue("articleType", "invited");
      setValue("targetIssue", "3");
    } else if (type === "negative") {
      setValue("articleType", "negative");
      setValue("targetIssue", "4");
    }
  }

  function bindWizard() {
    prevBtn?.addEventListener("click", () => goTo(step - 1));
    nextBtn?.addEventListener("click", () => {
      if (!validateStep(step)) return;
      if (step === 3) renderReview();
      goTo(step + 1);
    });
    form.addEventListener("submit", onSubmit);
  }

  function bindAuthors() {
    addAuthorBtn?.addEventListener("click", () => {
      authorsBox.appendChild(createAuthorRow());
      renumberCorresponding();
      refreshRemoveButtons();
      persistDraft();
    });
    authorsBox?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.classList.contains("remove-author")) return;
      target.closest("[data-author]")?.remove();
      renumberCorresponding();
      refreshRemoveButtons();
      persistDraft();
    });
    authorsBox?.addEventListener("input", persistDraft);
    form.addEventListener("input", persistDraft);
    form.addEventListener("change", persistDraft);
  }

  function bindFile() {
    fileInput?.addEventListener("change", () => {
      const file = fileInput.files?.[0] || null;
      const err = validateMainFile(file);
      if (err) {
        selectedFile = null;
        if (fileInput) fileInput.value = "";
        setFileError(err);
      } else {
        selectedFile = file;
        setFileError("");
      }
      updateFileLabel();
      persistDraft();
    });

    bindDropZone(fileDrop, (files) => {
      if (!files?.length || !fileInput) return;
      fileInput.files = files;
      fileInput.dispatchEvent(new Event("change"));
    });

    suppInput?.addEventListener("change", () => {
      const incoming = [...(suppInput.files || [])];
      const rejected = incoming.filter(
        (f) => !ALLOWED_SUPP.includes(extOf(f.name)) || f.size > MAX_MAIN_BYTES
      );
      suppFiles = incoming.filter(
        (f) => ALLOWED_SUPP.includes(extOf(f.name)) && f.size <= MAX_MAIN_BYTES
      );
      if (rejected.length) {
        alert(
          `Some supplementary files were rejected (allowed: PDF/DOCX/ZIP/CSV/XLSX/TXT/PNG/JPG/TIF, max 50 MB):\n${rejected
            .map((f) => f.name)
            .join("\n")}`
        );
      }
      suppName.textContent = suppFiles.length
        ? suppFiles.map((f) => `${f.name} (${formatBytes(f.size)})`).join("; ")
        : "None selected";
      persistDraft();
    });

    bindDropZone(suppDrop, (files) => {
      if (!files?.length || !suppInput) return;
      suppInput.files = files;
      suppInput.dispatchEvent(new Event("change"));
    });
  }

  function bindDropZone(zone, onFiles) {
    if (!zone) return;
    ["dragenter", "dragover"].forEach((type) => {
      zone.addEventListener(type, (e) => {
        e.preventDefault();
        zone.classList.add("is-active");
      });
    });
    ["dragleave", "drop"].forEach((type) => {
      zone.addEventListener(type, (e) => {
        e.preventDefault();
        zone.classList.remove("is-active");
      });
    });
    zone.addEventListener("drop", (e) => {
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      const dt = new DataTransfer();
      [...files].forEach((f) => dt.items.add(f));
      onFiles(dt.files);
    });
  }

  function bindDraft() {
    saveDraftBtn?.addEventListener("click", () => persistDraft(true));
    clearDraftBtn?.addEventListener("click", () => {
      localStorage.removeItem(DRAFT_KEY);
      selectedFile = null;
      suppFiles = [];
      form.reset();
      while (authorsBox.querySelectorAll("[data-author]").length > 1) authorsBox.lastElementChild?.remove();
      renumberCorresponding();
      refreshRemoveButtons();
      updateFileLabel();
      suppName.textContent = "None selected";
      updateAbstractCount();
      setDraftStatus("Draft cleared");
      goTo(1);
    });
    downloadPackageBtn?.addEventListener("click", () => downloadPackage());
    downloadFileBtn?.addEventListener("click", () => {
      if (!lastSubmission) return;
      const renamed = renameFile(lastSubmission.file, lastSubmission.id);
      downloadBlob(renamed, renamed.name);
    });
    newSubmissionBtn?.addEventListener("click", resetToNew);
  }

  function goTo(next) {
    step = Math.min(TOTAL_STEPS, Math.max(1, next));
    panes.forEach((pane) => {
      const active = Number(pane.dataset.stepPane) === step;
      pane.classList.toggle("is-active", active);
      pane.hidden = !active;
    });
    stepLabels.forEach((label) => {
      const n = Number(label.dataset.stepLabel);
      label.classList.toggle("is-active", n === step);
      label.classList.toggle("is-done", n < step);
    });
    if (prevBtn) {
      prevBtn.hidden = step === 1;
      prevBtn.style.display = step === 1 ? "none" : "";
    }
    if (nextBtn) {
      nextBtn.hidden = step === TOTAL_STEPS;
      nextBtn.style.display = step === TOTAL_STEPS ? "none" : "";
    }
    if (submitBtn) {
      submitBtn.hidden = step !== TOTAL_STEPS;
      submitBtn.style.display = step === TOTAL_STEPS ? "" : "none";
    }
    formError?.classList.add("hidden");
  }

  function validateStep(n) {
    clearErrors();
    let ok = true;

    if (n === 1) {
      ok =
        requireField("title", (v) => v.trim().length >= 8, "Title must be at least 8 characters.") &&
        requireField("articleType") &&
        requireField("section") &&
        requireField("language") &&
        requireField("targetIssue") &&
        ok;
      const kw = document.getElementById("keywords")?.value || "";
      const parts = kw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length < 3 || parts.length > 8) {
        markInvalid(document.getElementById("keywords"), "Enter 3–8 keywords, comma-separated.");
        ok = false;
      }
      const words = wordCount(abstractEl?.value || "");
      if (words < 40) {
        markInvalid(abstractEl, "Abstract too short (aim ≥ 40 words; FEBS ≤ 250).");
        ok = false;
      } else if (words > 300) {
        markInvalid(abstractEl, "Abstract too long (keep ≤ ~250–300 words).");
        ok = false;
      }
    }

    if (n === 2) {
      const authors = collectAuthors();
      if (!authors.length || authors.some((a) => !a.name || !a.affiliation)) {
        showError("Enter full name and affiliation for each author.");
        ok = false;
      }
      if (!authors.some((a) => a.corresponding)) {
        showError("Mark one corresponding author.");
        ok = false;
      }
      ok =
        requireField("email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email.") &&
        ok;
      const orcid = document.getElementById("orcid");
      if (orcid?.value.trim() && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid.value.trim())) {
        markInvalid(orcid, "ORCID format: 0000-0000-0000-0000");
        ok = false;
      }
    }

    if (n === 3) {
      const cover = document.getElementById("coverLetter");
      if (!cover?.value.trim() || cover.value.trim().length < 40) {
        markInvalid(cover, "Cover letter required (MDPI-style, ≥ 40 characters).");
        ok = false;
      }
      const fileErr = validateMainFile(selectedFile);
      if (fileErr) {
        setFileError(fileErr);
        showError(fileErr);
        ok = false;
      }
    }

    if (n === 4) {
      ok =
        requireField(
          "funding",
          (v) => Boolean(v.trim()),
          "Укажите номер гранта / финансирование или «None»."
        ) &&
        requireField(
          "dataIdentifiers",
          (v) => Boolean(v.trim()),
          "Укажите ссылку на данные (Zenodo/GitHub/GEO) или «None»."
        ) &&
        requireField("coi", (v) => Boolean(v.trim()), "Declare competing interests (or “None declared”).") &&
        requireField("dataAvailability", (v) => Boolean(v.trim()), "Data availability statement required.") &&
        ok;
      if (!document.getElementById("fairData")?.checked) {
        showError("Подтвердите соответствие данных стандартам FAIR (или обоснованные исключения).");
        ok = false;
      }
      if (!document.getElementById("doubleBlind")?.checked) {
        showError("Confirm anonymized manuscript for double-blind review.");
        ok = false;
      }
      if (!document.getElementById("confirm")?.checked) {
        showError("Confirm originality and author approval (MDPI statements).");
        ok = false;
      }
      if (!document.getElementById("ethics")?.checked) {
        showError("Confirm ethics compliance.");
        ok = false;
      }
      if (!document.getElementById("apcAck")?.checked) {
        showError(`Confirm APC (${apcAll()}).`);
        ok = false;
      }
    }

    return ok;
  }

  function validateMainFile(file) {
    if (!file) return "Upload the main manuscript (PDF or Word preferred).";
    const ext = extOf(file.name);
    if (!ALLOWED_MAIN.includes(ext)) {
      return `Unsupported type “${ext || "unknown"}”. Use PDF, DOCX, DOC, RTF, TEX or ZIP (LaTeX).`;
    }
    if (file.size > MAX_MAIN_BYTES) {
      return `File exceeds 50 MB (${formatBytes(file.size)}).`;
    }
    if (ext === ".zip" && file.size < 100) {
      return "ZIP archive looks empty — include LaTeX sources and a compiled PDF.";
    }
    return "";
  }

  function requireField(id, test = (v) => Boolean(v.trim()), message = "Required field") {
    const el = document.getElementById(id);
    if (!el) return false;
    const value = String(el.value || "");
    if (!test(value)) {
      markInvalid(el, message);
      return false;
    }
    return true;
  }

  function markInvalid(el, message) {
    if (!el) return;
    el.classList.add("is-invalid");
    const holder = el.closest("label")?.querySelector(".field-error") || fileError;
    if (holder) holder.textContent = message;
  }

  function clearErrors() {
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    form.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
    });
    formError?.classList.add("hidden");
    setFileError("");
  }

  function setFileError(msg) {
    if (fileError) fileError.textContent = msg || "";
  }

  function showError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.classList.remove("hidden");
  }

  function collectAuthors() {
    return [...authorsBox.querySelectorAll("[data-author]")].map((row, index) => ({
      name: row.querySelector('input[name="authorName"]')?.value.trim() || "",
      affiliation: row.querySelector('input[name="authorAffiliation"]')?.value.trim() || "",
      corresponding: Boolean(row.querySelector('input[name="corresponding"]:checked')),
      order: index + 1,
    }));
  }

  function collectPayload() {
    const keywords = (document.getElementById("keywords")?.value || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      journal: journalName(),
      title: document.getElementById("title").value.trim(),
      articleType: document.getElementById("articleType").value,
      section: document.getElementById("section").value,
      language: document.getElementById("language").value,
      targetIssue: document.getElementById("targetIssue")?.value || "2",
      keywords,
      authors: collectAuthors(),
      correspondingEmail: document.getElementById("email").value.trim(),
      orcid: document.getElementById("orcid").value.trim() || null,
      abstract: document.getElementById("abstract").value.trim(),
      abstractWordCount: wordCount(document.getElementById("abstract").value || ""),
      coverLetter: document.getElementById("coverLetter").value.trim(),
      contributions: document.getElementById("contributions")?.value.trim() || "",
      suggestedReviewers: document.getElementById("suggestedReviewers")?.value.trim() || "",
      funding: document.getElementById("funding")?.value.trim() || "",
      dataIdentifiers: document.getElementById("dataIdentifiers")?.value.trim() || "",
      fairData: Boolean(document.getElementById("fairData")?.checked),
      competingInterests: document.getElementById("coi").value.trim() || "None declared",
      dataAvailability: document.getElementById("dataAvailability").value.trim(),
      aiUse: document.getElementById("aiUse")?.value.trim() || "None declared",
      apc: apcAll(),
      earlyCareerFreePublication: false,
    };
  }

  function renderReview() {
    const p = collectPayload();
    const authors = p.authors
      .map(
        (a) =>
          `${escapeHtml(a.name)} — ${escapeHtml(a.affiliation)}${a.corresponding ? " ★ corr." : ""}`
      )
      .join("<br>");
    reviewBox.innerHTML = `
      <div><strong>Title:</strong> ${escapeHtml(p.title)}</div>
      <div><strong>Type / Section / Issue:</strong> ${escapeHtml(p.articleType)} · ${escapeHtml(p.section)} · #${escapeHtml(p.targetIssue)}</div>
      <div><strong>Keywords:</strong> ${escapeHtml(p.keywords.join(", "))}</div>
      <div><strong>Abstract:</strong> ${p.abstractWordCount} words</div>
      <div><strong>Authors:</strong><br>${authors}</div>
      <div><strong>Email:</strong> ${escapeHtml(p.correspondingEmail)}</div>
      <div><strong>Main file:</strong> ${selectedFile ? `${escapeHtml(selectedFile.name)} · ${formatBytes(selectedFile.size)}` : "—"}</div>
      <div><strong>Supplementary:</strong> ${suppFiles.length ? escapeHtml(suppFiles.map((f) => f.name).join(", ")) : "—"}</div>
      <div><strong>Funding:</strong> ${escapeHtml(p.funding || "—")}</div>
      <div><strong>Data IDs:</strong> ${escapeHtml(p.dataIdentifiers || "—")}</div>
      <div><strong>FAIR:</strong> ${p.fairData ? "confirmed" : "—"}</div>
      <div><strong>APC:</strong> ${escapeHtml(p.apc)} (after acceptance; standard APC)</div>
    `;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!validateStep(4) || !selectedFile) return;

    const id = makeSubmissionId();
    const payload = {
      ...collectPayload(),
      submissionId: id,
      submittedAt: new Date().toISOString(),
      status: "submitted",
      editorialStage: "awaiting_editorial_screening",
      manuscriptFile: {
        originalName: selectedFile.name,
        sizeBytes: selectedFile.size,
        type: selectedFile.type || "application/octet-stream",
      },
      supplementaryFiles: suppFiles.map((f) => ({
        originalName: f.name,
        sizeBytes: f.size,
        type: f.type || "application/octet-stream",
      })),
    };

    const receiptText = buildReceiptText(payload);
    const emailBody = buildEmailBody(payload);
    lastSubmission = { id, payload, file: selectedFile, suppFiles: [...suppFiles], receiptText, emailBody };

    if (submitBtn) submitBtn.disabled = true;
    setDraftStatus("Delivering package to Editorial Office…");

    const files = { manuscript: selectedFile };
    suppFiles.forEach((f, i) => {
      files[`supplementary_${i + 1}`] = f;
    });

    let serverResult = null;
    let delivery = null;
    try {
      delivery = await window.BSEmail.deliverPackage({
        endpoint: "/api/submit",
        payload,
        files,
        subject: `[${journalName()}] Submission ${id}: ${payload.title}`,
      });
      serverResult = delivery.serverResult;
      if (deliveryStatus) {
        const bits = ["Status: Submission receipt issued"];
        if (delivery.id) bits.push(`ID ${delivery.id}`);
        if (delivery.emailed) bits.push(`notified ${delivery.editorialEmail}`);
        deliveryStatus.textContent = bits.join(" · ");
      }
    } catch (err) {
      console.warn(err);
      const eml = window.BSEmail.buildEml({
        to: editorialEmail(),
        subject: `[${journalName()}] Submission ${id}: ${payload.title}`,
        body: emailBody,
        from: payload.correspondingEmail,
      });
      window.BSEmail.downloadText(`${id}_submission.eml`, eml, "message/rfc822");
      if (deliveryStatus) {
        deliveryStatus.textContent = `Status: Submitted · offline — .eml for ${editorialEmail()}`;
      }
    }

    try {
      localStorage.setItem("biological_sciences_last_submission", JSON.stringify(payload));
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }

    renderReceipt(payload, delivery);
    formSection.classList.add("hidden");
    receipt.classList.remove("hidden");
    receipt.scrollIntoView({ behavior: "smooth", block: "start" });
    mailtoLink.href = window.BSEmail.buildMailto(
      `[${journalName()}] Submission ${id}: ${payload.title}`,
      emailBody
    );
    if (submitBtn) submitBtn.disabled = false;
    setDraftStatus("Submission complete");
  }

  function renderReceipt(payload, delivery) {
    const authorsLine = payload.authors
      .map(
        (a) =>
          `${escapeHtml(a.name)} (${escapeHtml(a.affiliation)})${a.corresponding ? " ★" : ""}`
      )
      .join("<br>");
    const deliveryLine = delivery?.received || delivery?.emailed
      ? `Editorial store · notified ${editorialEmail()}${delivery?.id ? ` · ${delivery.id}` : ""}`
      : `Local .eml → ${editorialEmail()}`;
    receiptMeta.innerHTML = `
      <div><strong>Submission ID:</strong> ${escapeHtml(payload.submissionId)}</div>
      <div><strong>Received:</strong> ${escapeHtml(new Date(payload.submittedAt).toLocaleString("en-GB"))}</div>
      <div><strong>Title:</strong> ${escapeHtml(payload.title)}</div>
      <div><strong>Keywords:</strong> ${escapeHtml(payload.keywords.join(", "))}</div>
      <div><strong>Section / Issue:</strong> ${escapeHtml(payload.section)} · #${escapeHtml(payload.targetIssue)}</div>
      <div><strong>Authors:</strong><br>${authorsLine}</div>
      <div><strong>Email:</strong> ${escapeHtml(payload.correspondingEmail)}</div>
      <div><strong>File:</strong> ${escapeHtml(payload.manuscriptFile.originalName)} · ${formatBytes(payload.manuscriptFile.sizeBytes)}</div>
      <div><strong>Supplementary:</strong> ${payload.supplementaryFiles?.length || 0} file(s)</div>
      <div><strong>Delivery:</strong> ${escapeHtml(deliveryLine)}</div>
    `;
  }

  async function downloadPackage() {
    if (!lastSubmission) return;
    const { id, payload, file, suppFiles: extras, receiptText } = lastSubmission;
    if (typeof JSZip !== "undefined") {
      const zip = new JSZip();
      zip.file(`${id}_metadata.json`, JSON.stringify(payload, null, 2));
      zip.file(`${id}_cover_sheet.txt`, receiptText);
      zip.file(`${id}_${sanitizeFilename(file.name)}`, file);
      extras?.forEach((f, i) => zip.file(`${id}_supp${i + 1}_${sanitizeFilename(f.name)}`, f));
      downloadBlob(await zip.generateAsync({ type: "blob" }), `${id}_biological_sciences_submission.zip`);
      return;
    }
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `${id}_metadata.json`);
    await wait(200);
    downloadBlob(new Blob([receiptText], { type: "text/plain;charset=utf-8" }), `${id}_cover_sheet.txt`);
    await wait(200);
    downloadBlob(renameFile(file, id), renameFile(file, id).name);
  }

  function persistDraft(manual = false) {
    const draft = {
      ...collectPayload(),
      step,
      fileName: selectedFile?.name || null,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftStatus(
        manual
          ? `Draft saved · ${new Date().toLocaleTimeString("en-GB")}`
          : `Autosaved · ${new Date().toLocaleTimeString("en-GB")}`
      );
    } catch {
      setDraftStatus("Could not save draft");
    }
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      setValue("title", draft.title);
      setValue("articleType", draft.articleType);
      setValue("section", draft.section);
      setValue("language", draft.language || "en");
      setValue("targetIssue", draft.targetIssue || "2");
      setValue("keywords", Array.isArray(draft.keywords) ? draft.keywords.join(", ") : draft.keywords || "");
      setValue("email", draft.correspondingEmail);
      setValue("orcid", draft.orcid || "");
      setValue("abstract", draft.abstract || "");
      setValue("coverLetter", draft.coverLetter || "");
      setValue("contributions", draft.contributions || "");
      setValue("suggestedReviewers", draft.suggestedReviewers || "");
      setValue("funding", draft.funding || "");
      setValue("dataIdentifiers", draft.dataIdentifiers || "");
      const fair = document.getElementById("fairData");
      if (fair) fair.checked = Boolean(draft.fairData);
      setValue("coi", draft.competingInterests || "");
      setValue("dataAvailability", draft.dataAvailability || "");
      setValue("aiUse", draft.aiUse || "");
      if (Array.isArray(draft.authors) && draft.authors.length) {
        authorsBox.innerHTML = "";
        draft.authors.forEach((author, i) => authorsBox.appendChild(createAuthorRow(author, i)));
        renumberCorresponding();
        refreshRemoveButtons();
      }
      step = Number(draft.step) || 1;
      updateAbstractCount();
      setDraftStatus(`Draft restored · ${new Date(draft.savedAt).toLocaleString("en-GB")}`);
      return true;
    } catch {
      return false;
    }
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && "value" in el) el.value = value || "";
  }

  function setDraftStatus(text) {
    if (draftStatus) draftStatus.textContent = text;
  }

  function resetToNew() {
    lastSubmission = null;
    selectedFile = null;
    suppFiles = [];
    receipt.classList.add("hidden");
    formSection.classList.remove("hidden");
    form.reset();
    while (authorsBox.querySelectorAll("[data-author]").length > 1) authorsBox.lastElementChild?.remove();
    renumberCorresponding();
    refreshRemoveButtons();
    updateFileLabel();
    suppName.textContent = "None selected";
    updateAbstractCount();
    goTo(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createAuthorRow(data = { name: "", affiliation: "", corresponding: false }, index = 0) {
    const row = document.createElement("div");
    row.className = "author-row author-row-full";
    row.dataset.author = "";
    row.innerHTML = `
      <label>Full name
        <input type="text" name="authorName" required placeholder="Author name" value="${escapeAttr(data.name || "")}" />
        <span class="field-error"></span>
      </label>
      <label>Affiliation
        <input type="text" name="authorAffiliation" required placeholder="Institution" value="${escapeAttr(data.affiliation || "")}" />
        <span class="field-error"></span>
      </label>
      <label class="check-row corr-label">
        <input type="radio" name="corresponding" value="${index}" ${data.corresponding ? "checked" : ""} />
        <span>Corresponding</span>
      </label>
      <button type="button" class="btn btn-secondary btn-sm remove-author" aria-label="Remove author">✕</button>
    `;
    return row;
  }

  function renumberCorresponding() {
    [...authorsBox.querySelectorAll("[data-author]")].forEach((row, i) => {
      const radio = row.querySelector('input[name="corresponding"]');
      if (radio) radio.value = String(i);
    });
    if (![...authorsBox.querySelectorAll('input[name="corresponding"]')].some((r) => r.checked)) {
      const first = authorsBox.querySelector('input[name="corresponding"]');
      if (first) first.checked = true;
    }
  }

  function refreshRemoveButtons() {
    const rows = authorsBox.querySelectorAll("[data-author]");
    rows.forEach((row) => {
      const btn = row.querySelector(".remove-author");
      if (btn) btn.hidden = rows.length === 1;
    });
  }

  function updateFileLabel() {
    fileName.textContent = selectedFile
      ? `${selectedFile.name} (${formatBytes(selectedFile.size)})`
      : "No file selected";
  }

  function updateAbstractCount() {
    const words = wordCount(abstractEl?.value || "");
    if (abstractCount) {
      abstractCount.textContent = `${words} words${words > 250 ? " · over FEBS 250-word guide" : ""}`;
      abstractCount.style.color = words > 250 ? "var(--warn)" : "var(--ink-faint)";
    }
  }

  function buildReceiptText(payload) {
    const authors = payload.authors
      .map((a, i) => `${i + 1}. ${a.name} — ${a.affiliation}${a.corresponding ? " [corresponding]" : ""}`)
      .join("\n");
    return [
      `${journalName().toUpperCase()} — MANUSCRIPT SUBMISSION RECEIPT`,
      "Aligned with MDPI / FEBS / Nature initial-submission practice",
      "================================================",
      `Submission ID: ${payload.submissionId}`,
      `Submitted at:  ${payload.submittedAt}`,
      `Status:        ${payload.status}`,
      `APC:           ${payload.apc} (after acceptance; standard APC)`,
      "",
      `Title:         ${payload.title}`,
      `Article type:  ${payload.articleType}`,
      `Section:       ${payload.section}`,
      `Issue:         ${payload.targetIssue}`,
      `Keywords:      ${payload.keywords.join("; ")}`,
      `Language:      ${payload.language}`,
      `Corresponding: ${payload.correspondingEmail}`,
      `ORCID:         ${payload.orcid || "—"}`,
      "",
      "Authors:",
      authors,
      "",
      `Abstract (${payload.abstractWordCount} words):`,
      payload.abstract,
      "",
      "Cover letter:",
      payload.coverLetter,
      "",
      "Manuscript file:",
      `  ${payload.manuscriptFile.originalName} (${payload.manuscriptFile.sizeBytes} bytes)`,
      "",
      `Editorial email: ${editorialEmail()}`,
      "================================================",
    ].join("\n");
  }

  function buildEmailBody(payload) {
    const authors = payload.authors
      .map((a) => `- ${a.name} (${a.affiliation})${a.corresponding ? " ★" : ""}`)
      .join("\n");
    return [
      `Dear ${journalName()} Editorial Office,`,
      "",
      "Please accept the attached manuscript for consideration (initial submission package).",
      "",
      `Submission ID: ${payload.submissionId}`,
      `Title: ${payload.title}`,
      `Type / Section / Issue: ${payload.articleType} / ${payload.section} / ${payload.targetIssue}`,
      `Keywords: ${payload.keywords.join("; ")}`,
      `Abstract words: ${payload.abstractWordCount}`,
      `APC acknowledged: ${payload.apc} (after acceptance; standard APC)`,
      "",
      "Authors:",
      authors,
      "",
      `Corresponding email: ${payload.correspondingEmail}`,
      `Funding / grant: ${payload.funding || "—"}`,
      `Data identifiers: ${payload.dataIdentifiers || "—"}`,
      `FAIR confirmation: ${payload.fairData ? "yes" : "no"}`,
      `Competing interests: ${payload.competingInterests}`,
      `Data availability: ${payload.dataAvailability}`,
      `AI use: ${payload.aiUse}`,
      "",
      "Main manuscript and any supplementary files are attached / in the ZIP package.",
      "",
      "Kind regards,",
      payload.authors.find((a) => a.corresponding)?.name || payload.authors[0]?.name || "",
    ].join("\n");
  }

  function makeSubmissionId() {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    return `BS-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function wordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  function extOf(name) {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i).toLowerCase() : "";
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function sanitizeFilename(name) {
    return name.replace(/[^\w.\-()+\sа-яА-ЯёЁ]/gi, "_").replace(/\s+/g, "_");
  }

  function renameFile(file, id) {
    return new File([file], `${id}_${sanitizeFilename(file.name)}`, { type: file.type });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("'", "&#39;");
  }

  refreshRemoveButtons();
  renumberCorresponding();
})();
