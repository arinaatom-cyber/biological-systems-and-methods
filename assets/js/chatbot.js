(() => {
  const NAME = () =>
    window.BS?.NAME || window.BS_CONFIG?.journalName || "Biological Systems and Methods";
  const API = () => (window.BS_CONFIG?.apiBase || "").replace(/\/$/, "");
  const Agent = () => window.BSEditorialAgent;

  const state = {
    open: false,
    busy: false,
    sessionId: "",
    history: [],
    serverOnline: null,
  };

  function label() {
    return window.BSi18n?.t("chat.launcher") || "Чат редакции";
  }

  function sessionId() {
    if (state.sessionId) return state.sessionId;
    try {
      const saved = sessionStorage.getItem("bs_chat_sid");
      if (saved) {
        state.sessionId = saved;
        return saved;
      }
    } catch {
      /* ignore */
    }
    state.sessionId = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      sessionStorage.setItem("bs_chat_sid", state.sessionId);
    } catch {
      /* ignore */
    }
    return state.sessionId;
  }

  function mount() {
    if (window.BS_CONFIG?.chatEnabled === false) return;
    if (document.getElementById("bs-chat-root")) return;
    if (!Agent()) {
      console.warn("BSEditorialAgent missing — load editorial-agent.js before chatbot.js");
    }

    const root = document.createElement("div");
    root.id = "bs-chat-root";
    root.innerHTML = `
      <button type="button" class="chat-launcher" id="chat-launcher" aria-expanded="false" aria-controls="chat-panel">
        <span class="chat-launcher-dot" aria-hidden="true"></span>
        <span class="chat-launcher-label">${escapeHtml(label())}</span>
      </button>
      <section class="chat-panel" id="chat-panel" hidden>
        <header class="chat-head">
          <div>
            <strong>Агент редакции · ${escapeHtml(NAME())}</strong>
            <p id="chat-mode-line">FAQ · техпроверка · оператор</p>
          </div>
          <button type="button" class="chat-close" id="chat-close" aria-label="Закрыть чат">✕</button>
        </header>
        <div class="chat-quick" id="chat-quick">
          <button type="button" data-q="Сколько стоит APC?">APC</button>
          <button type="button" data-q="Как подать рукопись?">Подача</button>
          <button type="button" data-q="Какие сроки рецензирования?">Сроки</button>
          <button type="button" data-q="Расскажите про отрицательные результаты">Отрицательные результаты</button>
          <button type="button" data-q="Какие выпуски в томе 1?">Выпуски</button>
          <button type="button" data-action="check">Проверить рукопись</button>
          <button type="button" data-action="operator">Вызвать оператора</button>
        </div>
        <div class="chat-log" id="chat-log" role="log" aria-live="polite"></div>
        <form class="chat-compose" id="chat-form">
          <input id="chat-file" type="file" accept=".txt,.docx,.tex,.pdf,.zip,.md,.rtf,.doc" hidden />
          <label class="sr-only" for="chat-input">Сообщение</label>
          <input id="chat-input" type="text" placeholder="Спросите про APC, подачу или вставьте текст…" autocomplete="off" />
          <button type="button" class="btn btn-ghost btn-sm" id="chat-attach" title="Прикрепить рукопись">📎</button>
          <button type="submit" class="btn btn-primary btn-sm" id="chat-send">Отправить</button>
        </form>
      </section>
    `;
    document.body.appendChild(root);

    document.getElementById("chat-launcher")?.addEventListener("click", () => setOpen(!state.open));
    document.getElementById("chat-close")?.addEventListener("click", () => setOpen(false));
    document.getElementById("chat-form")?.addEventListener("submit", onUserSend);
    document.getElementById("chat-attach")?.addEventListener("click", () => {
      document.getElementById("chat-file")?.click();
    });
    document.getElementById("chat-file")?.addEventListener("change", onFilePicked);
    document.getElementById("chat-quick")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.action === "check") {
        document.getElementById("chat-file")?.click();
        return;
      }
      if (btn.dataset.action === "operator") {
        askOperator();
        return;
      }
      if (btn.dataset.q) sendMessage(btn.dataset.q);
    });

    window.addEventListener("bs:langchange", () => {
      const el = document.querySelector(".chat-launcher-label");
      if (el) el.textContent = label();
    });

    probeServer().then((online) => {
      state.serverOnline = online;
      const mode = document.getElementById("chat-mode-line");
      if (mode) {
        mode.textContent = online
          ? "Полный режим · сервер онлайн"
          : "Витринный режим · FAQ и текстовая проверка";
      }
      appendBubble("bot", Agent()?.welcome?.(online) || defaultWelcome(online));
    });
  }

  async function probeServer() {
    try {
      const res = await fetch(`${API()}/api/chat/welcome`, { cache: "no-store" });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data && data.ok !== false && data.reply);
    } catch {
      return false;
    }
  }

  function defaultWelcome(online) {
    return (
      `Редакционный агент · ${NAME()}\n\n` +
      (online
        ? "Сервер онлайн: FAQ, проверка файлов, тикеты оператору."
        : "Витринный режим: стандартные вопросы и проверка текста. Полный режим — python server.py.") +
      "\n\nНе принимаю статьи и не выношу решение о публикации."
    );
  }

  function setOpen(open) {
    state.open = open;
    const panel = document.getElementById("chat-panel");
    const launcher = document.getElementById("chat-launcher");
    if (!panel || !launcher) return;
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) document.getElementById("chat-input")?.focus();
  }

  function onUserSend(event) {
    event.preventDefault();
    const input = document.getElementById("chat-input");
    const text = (input?.value || "").trim();
    if (!text || state.busy) return;
    if (input) input.value = "";
    sendMessage(text);
  }

  async function askOperator() {
    setOpen(true);
    const note =
      window.prompt("Кратко опишите вопрос для оператора:", "Нужна помощь редакции") ||
      "Нужна помощь редакции";
    const contact = window.prompt("Email для ответа (необязательно):", "") || "";
    appendBubble("user", note);
    setBusy(true);
    try {
      if (state.serverOnline) {
        const res = await fetch(`${API()}/api/chat/escalate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId(),
            message: note,
            contact: contact.trim() || undefined,
            history: state.history.slice(-12),
          }),
        });
        const data = await res.json();
        appendBubble("bot", data.reply || "Обращение передано оператору.");
      } else {
        const local = Agent()?.respondLocal?.(note) || {
          reply: `Напишите в редакцию: ${Agent()?.email?.() || ""}`,
          mailto: Agent()?.operatorMailto?.(note),
        };
        appendBubble("bot", local.reply);
        if (local.mailto) window.location.href = local.mailto;
      }
    } catch {
      const mailto = Agent()?.operatorMailto?.(note);
      appendBubble("bot", "Не удалось создать тикет. Откроется письмо в редакцию.");
      if (mailto) window.location.href = mailto;
    } finally {
      setBusy(false);
    }
  }

  async function onFilePicked(event) {
    const input = event.target;
    const file = input?.files?.[0];
    if (!file) return;
    setOpen(true);
    appendBubble("user", `📎 Проверить рукопись: ${file.name}`);
    setBusy(true);
    try {
      if (state.serverOnline) {
        const fd = new FormData();
        fd.append("sessionId", sessionId());
        fd.append("message", "Проверь рукопись");
        fd.append("manuscript", file, file.name);
        const res = await fetch(`${API()}/api/chat/check`, { method: "POST", body: fd });
        const data = await res.json();
        appendBubble("bot", data.reply || data.error || "Проверка не удалась.");
      } else {
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!["txt", "md", "tex", "rtf", "csv"].includes(ext)) {
          appendBubble(
            "bot",
            `В витринном режиме читаю .txt / .md / .tex. Для ${ext.toUpperCase()} запустите python server.py или вставьте текст в чат («проверь: …»).`
          );
        } else {
          const text = await file.text();
          const result = Agent()?.analyzeText?.(text, file.name) || { reply: "Агент недоступен." };
          appendBubble("bot", result.reply);
        }
      }
    } catch {
      appendBubble("bot", "Не удалось прочитать файл. Вставьте текст в сообщение или запустите сервер.");
    } finally {
      setBusy(false);
      if (input) input.value = "";
    }
  }

  async function sendMessage(text) {
    setOpen(true);
    appendBubble("user", text);
    setBusy(true);
    try {
      let data = null;
      if (state.serverOnline) {
        try {
          const res = await fetch(`${API()}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionId(),
              message: text,
              history: state.history.slice(-12),
            }),
          });
          data = await res.json();
          if (!res.ok && !data?.reply) throw new Error("bad");
        } catch {
          state.serverOnline = false;
          data = null;
        }
      }
      if (!data?.reply) {
        data = Agent()?.respondLocal?.(text) || {
          reply: "Агент временно недоступен. Напишите в редакцию.",
        };
      }
      appendBubble("bot", data.reply);
      if (data.mailto) {
        window.setTimeout(() => {
          window.location.href = data.mailto;
        }, 400);
      }
    } finally {
      setBusy(false);
    }
  }

  function setBusy(busy) {
    state.busy = busy;
    const send = document.getElementById("chat-send");
    const input = document.getElementById("chat-input");
    if (send) send.disabled = busy;
    if (input) input.disabled = busy;
    const typing = document.getElementById("chat-typing");
    if (busy && !typing) {
      const el = document.createElement("div");
      el.id = "chat-typing";
      el.className = "chat-bubble chat-bot chat-typing";
      el.textContent = "Агент печатает…";
      document.getElementById("chat-log")?.appendChild(el);
    } else if (!busy && typing) {
      typing.remove();
    }
  }

  function appendBubble(role, text) {
    const log = document.getElementById("chat-log");
    if (!log) return;
    document.getElementById("chat-typing")?.remove();
    const el = document.createElement("div");
    el.className = `chat-bubble chat-${role}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    state.history.push({ role, text: String(text).slice(0, 2000) });
    if (state.history.length > 40) state.history = state.history.slice(-40);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  window.BSChat = {
    mount,
    open: () => setOpen(true),
    ask: sendMessage,
  };
})();
