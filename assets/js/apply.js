(() => {
  const form = document.getElementById("apply-form");
  if (!form) return;

  const statusEl = document.getElementById("apply-status");
  const DRAFT_KEY = "bs_join_draft_v1";

  document.getElementById("apply-draft-btn")?.addEventListener("click", () => {
    const draft = collect();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setStatus("Черновик сохранён в этом браузере.", "ok");
    } catch {
      setStatus("Не удалось сохранить черновик локально.", "err");
    }
  });

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      Object.entries(draft).forEach(([k, v]) => {
        const el = form.elements.namedItem(k) || document.getElementById(k);
        if (!el) return;
        if (el.type === "checkbox") el.checked = Boolean(v);
        else el.value = v ?? "";
      });
    }
  } catch {
    /* ignore */
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    if (!validate()) {
      setStatus("Проверьте обязательные поля.", "err");
      return;
    }

    const applicationId = `APP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const payload = {
      journal: window.BS_CONFIG?.journalName || "Biological Systems and Methods",
      type: "editor-reviewer-application",
      applicationId,
      submittedAt: new Date().toISOString(),
      ...collect(),
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setStatus("Отправка заявки…");

    try {
      if (!window.BSEmail?.deliverPackage) {
        throw new Error("email helper missing");
      }
      const jName = window.BS_CONFIG?.journalName || "Biological Systems and Methods";
      const delivery = await window.BSEmail.deliverPackage({
        endpoint: "/api/apply",
        payload,
        files: {},
        subject: `[${jName}] Application ${applicationId}`,
      });
      if (delivery?.emailed || delivery?.serverResult?.ok || delivery?.id) {
        setStatus(
          `Заявка передана${delivery.id ? ` · ${delivery.id}` : ""}. Это подтверждение получения заявки, а не назначение в редколлегию.`,
          "ok"
        );
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        form.reset();
      } else {
        setStatus(
          "Данные не удалось подтверждённо передать. Сохраните черновик или напишите на email координатора.",
          "err"
        );
      }
    } catch (err) {
      console.warn(err);
      const email = window.BS?.contactEmail?.() || "arina.atom@gmail.com";
      setStatus(
        `Сервер недоступен. Заявка не отправлена автоматически. Напишите на ${email} или сохраните черновик.`,
        "err"
      );
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  function collect() {
    return {
      firstName: val("firstName"),
      lastName: val("lastName"),
      degree: val("degree"),
      position: val("position"),
      organization: val("organization"),
      country: val("country"),
      email: val("email"),
      orcid: val("orcid"),
      scopus: val("scopus"),
      wos: val("wos"),
      interests: val("interests"),
      keywords: val("keywords"),
      reviewExperience: val("reviewExperience"),
      editorialExperience: val("editorialExperience"),
      publications: val("publications"),
      role: val("role"),
      coi: val("coi"),
      comment: val("comment"),
      policyConsent: Boolean(document.getElementById("policyConsent")?.checked),
    };
  }

  function val(id) {
    return (document.getElementById(id)?.value || "").trim();
  }

  function validate() {
    let ok = true;
    const required = [
      "firstName",
      "lastName",
      "organization",
      "country",
      "email",
      "orcid",
      "interests",
      "keywords",
      "role",
    ];
    required.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !String(el.value || "").trim()) {
        markError(el, "Обязательное поле");
        ok = false;
      }
    });
    const consent = document.getElementById("policyConsent");
    if (consent && !consent.checked) {
      ok = false;
      setStatus("Необходимо согласие с политиками журнала.", "err");
    }
    return ok;
  }

  function markError(el, msg) {
    if (!el) return;
    const err = el.parentElement?.querySelector(".field-error");
    if (err) err.textContent = msg;
    el.setAttribute("aria-invalid", "true");
  }

  function clearErrors() {
    form.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
    });
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  }

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.kind = kind || "";
  }
})();
