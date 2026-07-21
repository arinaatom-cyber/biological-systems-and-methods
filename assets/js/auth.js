(() => {
  const PROVIDER_META = {
    yandex: { label: "Яндекс", className: "auth-btn-yandex" },
    mailru: { label: "Mail.ru", className: "auth-btn-mailru" },
    google: { label: "Gmail / Google", className: "auth-btn-google" },
    orcid: { label: "ORCID", className: "auth-btn-orcid" },
  };

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body?.dataset?.page;
    if (page === "login") initLogin();
    if (page === "account") initAccount();
    refreshHeaderAuth();
  });

  window.addEventListener("bs:langchange", refreshHeaderAuth);

  async function fetchJson(url, opts) {
    const res = await fetch(url, { credentials: "same-origin", cache: "no-store", ...opts });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  async function refreshHeaderAuth() {
    const slot = document.getElementById("auth-nav-slot");
    if (!slot) return;
    try {
      const { data } = await fetchJson("/api/auth/me");
      if (data.authenticated && data.user) {
        const name = data.user.name || data.user.email || data.user.orcid || "Аккаунт";
        slot.innerHTML = `
          <a href="account.html" class="nav-link-auth" title="${escapeHtml(name)}">${escapeHtml(shortName(name))}</a>
          <button type="button" class="nav-link-auth nav-link-quiet" id="auth-logout-btn">Выйти</button>`;
        document.getElementById("auth-logout-btn")?.addEventListener("click", logout);
      } else {
        slot.innerHTML = `<a href="login.html" class="nav-link-auth">Войти</a>`;
      }
    } catch {
      slot.innerHTML = `<a href="login.html" class="nav-link-auth">Войти</a>`;
    }
  }

  async function logout() {
    await fetchJson("/api/auth/logout", { method: "POST" });
    location.href = "login.html";
  }

  async function initLogin() {
    const host = document.getElementById("auth-providers");
    const status = document.getElementById("auth-status");
    if (!host) return;

    const params = new URLSearchParams(location.search);
    if (params.get("error")) {
      setStatus(status, `Вход не выполнен: ${params.get("error")}. Проверьте настройки OAuth.`, "err");
    }

    try {
      const { data } = await fetchJson("/api/auth/providers");
      const providers = data.providers || [];
      host.innerHTML = providers
        .map((p) => {
          const meta = PROVIDER_META[p.id] || { label: p.labelRu || p.label, className: "" };
          const label = meta.label || p.labelRu || p.label;
          if (p.configured && p.loginUrl) {
            return `<a class="btn auth-btn ${meta.className}" href="${p.loginUrl}">Войти через ${escapeHtml(label)}</a>`;
          }
          return `<button type="button" class="btn auth-btn auth-btn-disabled ${meta.className}" data-provider="${p.id}" aria-disabled="true">
            ${escapeHtml(label)} · не настроено
          </button>`;
        })
        .join("");

      host.querySelectorAll("[data-provider]").forEach((btn) => {
        btn.addEventListener("click", () => {
          setStatus(
            status,
            `Провайдер «${btn.dataset.provider}» ещё не подключён. Заполните Client ID и Secret в .env (см. .env.example) и перезапустите server.py. Успешный вход без ключей не выполняется.`,
            "err"
          );
        });
      });

      const ready = providers.filter((p) => p.configured).length;
      if (!params.get("error")) {
        setStatus(
          status,
          ready
            ? `Доступно провайдеров: ${ready}. Выберите способ входа.`
            : "Пока ни один провайдер не настроен — кнопки не имитируют вход. Добавьте ключи в .env.",
          ready ? "ok" : ""
        );
      }
    } catch {
      setStatus(
        status,
        "Сервер авторизации недоступен. Запустите python server.py и откройте сайт через http://127.0.0.1:5173",
        "err"
      );
      host.innerHTML = Object.entries(PROVIDER_META)
        .map(
          ([id, meta]) =>
            `<button type="button" class="btn auth-btn auth-btn-disabled ${meta.className}" disabled>${escapeHtml(meta.label)}</button>`
        )
        .join("");
    }
  }

  async function initAccount() {
    const panel = document.getElementById("account-panel");
    if (!panel) return;
    try {
      const { data } = await fetchJson("/api/auth/me");
      if (!data.authenticated || !data.user) {
        panel.innerHTML = `
          <p>Вы не вошли в систему.</p>
          <p><a class="btn btn-primary" href="login.html">Войти</a></p>`;
        return;
      }
      const u = data.user;
      panel.innerHTML = `
        <dl class="dl-panel">
          <dt>Имя</dt><dd>${escapeHtml(u.name || "—")}</dd>
          <dt>Email</dt><dd>${escapeHtml(u.email || "—")}</dd>
          <dt>Провайдер</dt><dd>${escapeHtml(u.provider || "—")}</dd>
          <dt>ORCID</dt><dd>${escapeHtml(u.orcid || "—")}</dd>
        </dl>
        <div class="cta-row" style="margin-top:1.25rem">
          <a class="btn btn-primary" href="submit.html">Подать рукопись</a>
          <button type="button" class="btn btn-ghost" id="account-logout">Выйти</button>
        </div>`;
      document.getElementById("account-logout")?.addEventListener("click", logout);
    } catch {
      panel.innerHTML = `<p class="form-note">Не удалось проверить сессию. Запустите server.py.</p>
        <p><a href="login.html">На страницу входа</a></p>`;
    }
  }

  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg;
    el.dataset.kind = kind || "";
  }

  function shortName(name) {
    const s = String(name || "").trim();
    return s.length > 22 ? s.slice(0, 20) + "…" : s;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  window.BSAuth = { refreshHeaderAuth, logout };
})();
