(() => {
  const NAME = () =>
    window.BS?.NAME || window.BS_CONFIG?.journalName || "Biological Systems and Methods";
  const API = () => (window.BS_CONFIG?.apiBase || "").replace(/\/$/, "");

  const state = {
    open: false,
    busy: false,
    sessionId: "",
    history: [],
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
            <p>Стандартные вопросы · техпроверка рукописи · оператор</p>
          </div>
          <button type="button" class="chat-close" id="chat-close" aria-label="Закрыть чат">✕</button>
        </header>
        <div class="chat-quick" id="chat-quick">
          <button type="button" data-q="Сколько стоит APC?">APC</button>
          <button type="button" data-q="Как подать рукопись?">Подача</button>
          <button type="button" data-q="Какие сроки рецензирования?">Сроки</button>
          <button type="button" data-q="Расскажите про отрицательные результаты">Отрицательные результаты</button>
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
      if (btn.dataset.q) {
        sendMessage(btn.dataset.q);
      }
    });

    window.addEventListener("bs:langchange", () => {
      const el = document.querySelector(".chat-launcher-label");
      if (el) el.textContent = label();
    });

    loadWelcome();
  }

  async function loadWelcome() {
    try {
      const res = await fetch(`${API()}/api/chat/welcome`, { cache: "no-store" });
      const data = await res.json();
      appendBubble("bot", data.reply || defaultWelcome());
    } catch {
      appendBubble("bot", defaultWelcome());
    }
  }

  function defaultWelcome() {
    return (
      `Редакционный агент · ${NAME()}\n\n` +
      "Отвечаю на стандартные вопросы, делаю техническую предпроверку рукописи " +
      "(символы, слова, разделы) и при необходимости вызываю оператора.\n\n" +
      "Не принимаю статьи и не выношу решение о публикации."
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
    const contact = window.prompt("Email для ответа оператора (необязательно):", "") || "";
    const note =
      window.prompt("Кратко опишите вопрос для оператора:", "Нужна помощь редакции") ||
      "Нужна помощь редакции";
    appendBubble("user", note);
    setBusy(true);
    try {
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
    } catch {
      appendBubble(
        "bot",
        `Не удалось создать тикет. Напишите напрямую: ${
          window.BS_CONFIG?.temporaryEmail || window.BS_CONFIG?.editorialEmail || "arina.atom@gmail.com"
        }`
      );
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
      const fd = new FormData();
      fd.append("sessionId", sessionId());
      fd.append("message", "Проверь рукопись");
      fd.append("manuscript", file, file.name);
      fd.append("history", JSON.stringify(state.history.slice(-8)));
      const res = await fetch(`${API()}/api/chat/check`, { method: "POST", body: fd });
      const data = await res.json();
      appendBubble("bot", data.reply || data.error || "Проверка не удалась.");
    } catch {
      appendBubble("bot", "Не удалось отправить файл на проверку. Убедитесь, что запущен python server.py.");
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
      const res = await fetch(`${API()}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId(),
          message: text,
          history: state.history.slice(-12),
        }),
      });
      const data = await res.json();
      appendBubble("bot", data.reply || data.error || "Нет ответа от агента.");
      if (data.intent === "faq" && /подат|submit/i.test(text) && window.BS?.submitHref) {
        const href = window.BS.submitHref();
        if (/^https?:\/\//i.test(href)) {
          appendBubble("bot", `Прямая ссылка на подачу: ${href}`);
        }
      }
    } catch {
      appendBubble(
        "bot",
        "Сервер агента недоступен. Запустите `python server.py` и обновите страницу, либо напишите в редакцию."
      );
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
