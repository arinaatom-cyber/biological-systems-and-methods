(() => {
  async function fileToBase64(file) {
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  async function sendToServer(endpoint, payload, files = {}) {
    const apiBase = window.BS_CONFIG?.apiBase || "";
    const form = new FormData();
    form.append("payload", JSON.stringify(payload));
    Object.entries(files).forEach(([key, file]) => {
      if (file) form.append(key, file, file.name);
    });

    const res = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Server error ${res.status}`);
    }
    return res.json();
  }

  /**
   * Notify editorialEmail via FormSubmit.co (no SMTP needed).
   * First use: open the confirmation link FormSubmit sends to that Gmail.
   * Does not attach large manuscript binaries — metadata + note only.
   */
  async function sendViaFormSubmit(payload, subject) {
    const email = window.BS_CONFIG?.editorialEmail;
    if (!email || !window.BS_CONFIG?.formSubmitEnabled) {
      throw new Error("Editorial email is not configured");
    }
    const body = {
      _subject: subject,
      _template: "table",
      _captcha: "false",
      _replyto: payload.correspondingEmail || payload.email || "",
      journal: window.BS_CONFIG.journalName || "Biological Systems and Methods",
      to_editorial: email,
      message: JSON.stringify(payload, null, 2),
    };
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("FormSubmit delivery failed");
    return res.json();
  }

  /** Best-effort: server inbox first, then email notification to editorial Gmail. */
  async function deliverPackage({ endpoint, payload, files, subject }) {
    let serverResult = null;
    let formSubmit = null;
    let serverError = null;
    let formError = null;

    try {
      serverResult = await sendToServer(endpoint, payload, files);
    } catch (err) {
      serverError = err;
    }

    if (window.BS_CONFIG?.formSubmitEnabled && window.BS_CONFIG?.editorialEmail) {
      try {
        formSubmit = await sendViaFormSubmit(
          {
            ...payload,
            _deliveryNote:
              "This is an editorial notification (metadata). Manuscript/CV binaries are stored in the private editorial store on the server host, not exposed on the public site.",
            _submissionId: serverResult?.id || payload.submissionId || payload.applicationId || null,
          },
          subject
        );
      } catch (err) {
        formError = err;
      }
    }

    if (!serverResult && !formSubmit) {
      throw serverError || formError || new Error("Delivery failed");
    }

    return {
      serverResult,
      formSubmit,
      serverError: serverError ? String(serverError.message || serverError) : null,
      formError: formError ? String(formError.message || formError) : null,
      emailed: Boolean(serverResult?.emailed || formSubmit),
      editorialEmail: window.BS_CONFIG.editorialEmail,
      id: serverResult?.id || null,
      received: Boolean(serverResult?.received || serverResult?.ok || formSubmit),
    };
  }

  function buildMailto(subject, body) {
    const email = window.BS_CONFIG?.editorialEmail || "arina.atom@gmail.com";
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function downloadText(filename, text, type = "text/plain") {
    const blob = new Blob([text], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buildEml({ to, subject, body, from }) {
    return [
      `From: ${from || "noreply@biologicalsciences.local"}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      body,
    ].join("\r\n");
  }

  window.BSEmail = {
    fileToBase64,
    sendToServer,
    sendViaFormSubmit,
    deliverPackage,
    buildMailto,
    downloadText,
    buildEml,
  };
})();
