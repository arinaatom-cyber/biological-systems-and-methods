#!/usr/bin/env python3
"""Biological Sciences trial server: static site + private submission store + optional SMTP."""

from __future__ import annotations

import json
import logging
import mimetypes
import os
import smtplib
import uuid
from datetime import datetime, timezone
from email.message import EmailMessage
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent


def load_dotenv(path: Path) -> None:
    """Minimal .env loader (no dependency). Does not override existing env vars."""
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip("'").strip('"')
        if key and key not in os.environ:
            os.environ[key] = val


load_dotenv(ROOT / ".env")

import auth_oauth  # noqa: E402  — after .env so PUBLIC_BASE and secrets are visible
import editorial_agent  # noqa: E402

# Private data lives outside the static tree and is never served over HTTP.
DATA_ROOT = Path(os.environ.get("BS_DATA_DIR", str(ROOT / ".private")))
INBOX = DATA_ROOT / "inbox"
INBOX.mkdir(parents=True, exist_ok=True)
CHAT_MAX_BYTES = int(os.environ.get("BS_CHAT_MAX_BYTES", str(8 * 1024 * 1024)))
LOG_PATH = DATA_ROOT / "server.log"

MAX_BODY_BYTES = int(os.environ.get("BS_MAX_UPLOAD_BYTES", str(55 * 1024 * 1024)))
MAX_FILE_BYTES = int(os.environ.get("BS_MAX_FILE_BYTES", str(50 * 1024 * 1024)))
MAX_FILES = 12

ALLOWED_MANUSCRIPT_EXT = {".pdf", ".doc", ".docx", ".zip", ".tex", ".rtf"}
ALLOWED_SUPP_EXT = {
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
}
ALLOWED_CV_EXT = {".pdf", ".doc", ".docx"}

BLOCKED_URL_PREFIXES = (
    "/inbox",
    "/.private",
    "/.git",
    "/.env",
    "/node_modules",
)

EDITORIAL_EMAIL = os.environ.get("BS_EDITORIAL_EMAIL", "arina.atom@gmail.com")
SMTP_HOST = os.environ.get("BS_SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("BS_SMTP_PORT", "587"))
SMTP_USER = os.environ.get("BS_SMTP_USER", "")
SMTP_PASS = os.environ.get("BS_SMTP_PASS", "")
SMTP_FROM = os.environ.get("BS_SMTP_FROM", SMTP_USER or "noreply@biologicalsciences.local")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("bioscientia")


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def ext_of(name: str) -> str:
    return Path(name).suffix.lower()


def validate_submit_payload(payload: dict, files: dict[str, tuple[str, bytes]]) -> str | None:
    title = str(payload.get("title") or "").strip()
    email = str(payload.get("correspondingEmail") or payload.get("email") or "").strip()
    funding = str(payload.get("funding") or "").strip()
    data_ids = str(payload.get("dataIdentifiers") or "").strip()
    fair = payload.get("fairData")
    if len(title) < 8:
        return "title is required (min 8 characters)"
    if "@" not in email or "." not in email.split("@")[-1]:
        return "correspondingEmail is required"
    if not funding:
        return "funding / grant number is required (or None)"
    if not data_ids:
        return "dataIdentifiers is required (repository URL or None)"
    if fair not in (True, "true", "True", 1, "1", "yes", "on"):
        return "fairData confirmation is required"
    if "manuscript" not in files:
        return "manuscript file is required"
    fname, content = files["manuscript"]
    if ext_of(fname) not in ALLOWED_MANUSCRIPT_EXT:
        return f"manuscript type not allowed ({ext_of(fname) or 'unknown'})"
    if len(content) > MAX_FILE_BYTES:
        return "manuscript exceeds 50 MB"
    if len(files) > MAX_FILES:
        return "too many files"
    for key, (fname, content) in files.items():
        if key == "manuscript":
            continue
        if len(content) > MAX_FILE_BYTES:
            return f"{key} exceeds 50 MB"
        if key.startswith("supplementary") and ext_of(fname) not in ALLOWED_SUPP_EXT:
            return f"supplementary type not allowed ({ext_of(fname) or 'unknown'})"
    return None


def validate_apply_payload(payload: dict, files: dict[str, tuple[str, bytes]]) -> str | None:
    email = str(payload.get("email") or "").strip()
    first = str(payload.get("firstName") or "").strip()
    last = str(payload.get("lastName") or "").strip()
    orcid = str(payload.get("orcid") or "").strip()
    role = str(payload.get("role") or "").strip()
    if not first or not last:
        return "firstName and lastName are required"
    if "@" not in email:
        return "email is required"
    if not orcid:
        return "orcid is required"
    if not role:
        return "role is required"
    # CV is optional for editor/reviewer applications
    if "cv" in files:
        fname, content = files["cv"]
        if ext_of(fname) not in ALLOWED_CV_EXT:
            return f"cv type not allowed ({ext_of(fname) or 'unknown'})"
        if len(content) > MAX_FILE_BYTES:
            return "cv exceeds 50 MB"
    return None


def save_submission(kind: str, payload: dict, files: dict[str, tuple[str, bytes]]) -> dict:
    sid = (
        payload.get("submissionId")
        or payload.get("applicationId")
        or f"{kind.upper()}-{utc_now()}-{uuid.uuid4().hex[:6].upper()}"
    )
    folder = INBOX / f"{utc_now()}_{sid}"
    folder.mkdir(parents=True, exist_ok=True)

    (folder / "payload.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    saved_files = []
    for field, (filename, content) in files.items():
        safe = Path(filename).name or f"{field}.bin"
        target = folder / f"{field}_{safe}"
        target.write_bytes(content)
        saved_files.append(str(target.name))

    body_lines = [
        f"Biological Sciences — {kind}",
        f"ID: {sid}",
        f"Saved: {folder}",
        "",
        json.dumps(payload, indent=2, ensure_ascii=False),
        "",
        "Attachments: " + (", ".join(saved_files) if saved_files else "none"),
    ]
    body = "\n".join(body_lines)
    (folder / "message.txt").write_text(body, encoding="utf-8")

    eml_path = folder / "message.eml"
    msg = EmailMessage()
    msg["Subject"] = f"[Biological Sciences] {kind} {sid}"
    msg["From"] = SMTP_FROM
    msg["To"] = EDITORIAL_EMAIL
    msg.set_content(body)
    for field, (filename, content) in files.items():
        ctype, _ = mimetypes.guess_type(filename)
        maintype, subtype = (ctype or "application/octet-stream").split("/", 1)
        msg.add_attachment(
            content, maintype=maintype, subtype=subtype, filename=Path(filename).name
        )
    eml_path.write_bytes(bytes(msg))

    emailed = False
    if SMTP_HOST and SMTP_USER and SMTP_PASS:
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as smtp:
                smtp.starttls()
                smtp.login(SMTP_USER, SMTP_PASS)
                smtp.send_message(msg)
            emailed = True
        except Exception as exc:  # noqa: BLE001
            log.exception("SMTP delivery failed for %s: %s", sid, exc)

    # Never expose filesystem paths or SMTP internals to the client.
    return {
        "ok": True,
        "id": sid,
        "received": True,
        "emailed": emailed,
        "editorialEmail": EDITORIAL_EMAIL,
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # Allow LAN preview from another device on the same network.
        origin = self.headers.get("Origin") or "*"
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Vary", "Origin")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def is_blocked_path(self, raw_path: str) -> bool:
        path = unquote(urlparse(raw_path).path).replace("\\", "/")
        lowered = path.lower()
        if any(lowered == p or lowered.startswith(p + "/") for p in BLOCKED_URL_PREFIXES):
            return True
        # Block any attempt to traverse into private data.
        try:
            requested = Path(self.translate_path(raw_path)).resolve()
            if DATA_ROOT.resolve() in requested.parents or requested == DATA_ROOT.resolve():
                return True
            if (ROOT / "inbox").resolve() in requested.parents or requested == (ROOT / "inbox").resolve():
                return True
        except OSError:
            return True
        return False

    def do_GET(self):  # noqa: N802
        if self.is_blocked_path(self.path):
            self.send_error(404, "Not found")
            return
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/auth/providers":
            self.send_json({"ok": True, "providers": auth_oauth.list_providers(), "publicBase": auth_oauth.PUBLIC_BASE})
            return

        if path == "/api/chat/welcome":
            self.send_json(
                {
                    "ok": True,
                    "reply": editorial_agent.welcome_message(),
                    "llmEnabled": bool(
                        os.environ.get("BS_OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
                    ),
                }
            )
            return

        if path == "/api/auth/me":
            user = auth_oauth.get_session(self._session_token())
            self.send_json({"ok": True, "authenticated": bool(user), "user": user})
            return

        if path.startswith("/api/auth/login/"):
            pid = path.rsplit("/", 1)[-1]
            url, err = auth_oauth.build_authorize_url(pid)
            if err or not url:
                self.send_json(
                    {
                        "ok": False,
                        "error": err or "not_configured",
                        "message": "Провайдер не настроен. Добавьте Client ID и Secret в переменные окружения (см. .env.example).",
                    },
                    503,
                )
                return
            self.send_response(302)
            self.send_header("Location", url)
            self.end_headers()
            return

        if path.startswith("/api/auth/callback/"):
            pid = path.rsplit("/", 1)[-1]
            query = parse_qs(parsed.query)
            location, token = auth_oauth.handle_callback(pid, query)
            self.send_response(302)
            self.send_header("Location", location)
            if token:
                self.send_header(
                    "Set-Cookie",
                    f"bs_session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={auth_oauth.SESSION_TTL}",
                )
            self.end_headers()
            return

        return super().do_GET()

    def do_HEAD(self):  # noqa: N802
        if self.is_blocked_path(self.path):
            self.send_error(404, "Not found")
            return
        return super().do_HEAD()

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.end_headers()

    def _session_token(self) -> str | None:
        cookie = self.headers.get("Cookie") or ""
        for part in cookie.split(";"):
            part = part.strip()
            if part.startswith("bs_session="):
                return part.split("=", 1)[1].strip() or None
        return None

    def do_POST(self):  # noqa: N802
        if self.path == "/api/auth/logout":
            auth_oauth.destroy_session(self._session_token())
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Set-Cookie", "bs_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0")
            body = b'{"ok":true,"authenticated":false}'
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path in {"/api/chat", "/api/chat/check", "/api/chat/escalate"}:
            self.handle_chat_api()
            return

        if self.path not in {"/api/submit", "/api/apply"}:
            self.send_error(404, "Unknown API route")
            return

        length_hdr = self.headers.get("Content-Length", "0")
        try:
            length = int(length_hdr)
        except ValueError:
            self.send_json({"ok": False, "error": "Invalid Content-Length"}, 400)
            return

        if length <= 0:
            self.send_json({"ok": False, "error": "Empty body"}, 400)
            return
        if length > MAX_BODY_BYTES:
            self.send_json({"ok": False, "error": "Payload too large (max 55 MB)"}, 413)
            return

        raw = self.rfile.read(length)
        content_type = self.headers.get("Content-Type", "")

        payload: dict = {}
        files: dict[str, tuple[str, bytes]] = {}

        if content_type.startswith("multipart/form-data"):
            payload, files = parse_multipart(raw, content_type)
        else:
            try:
                payload = json.loads(raw.decode("utf-8") or "{}")
            except json.JSONDecodeError:
                self.send_json({"ok": False, "error": "Invalid JSON"}, 400)
                return

        if self.path.endswith("submit"):
            err = validate_submit_payload(payload, files)
            kind = "manuscript"
        else:
            err = validate_apply_payload(payload, files)
            kind = "editor-reviewer-application"

        if err:
            self.send_json({"ok": False, "error": err}, 400)
            return

        try:
            result = save_submission(kind, payload, files)
            self.send_json(result, 200)
        except Exception:
            log.exception("Failed to save %s", kind)
            self.send_json({"ok": False, "error": "Internal server error"}, 500)

    def handle_chat_api(self):
        length_hdr = self.headers.get("Content-Length", "0")
        try:
            length = int(length_hdr)
        except ValueError:
            self.send_json({"ok": False, "error": "Invalid Content-Length"}, 400)
            return
        if length <= 0:
            self.send_json({"ok": False, "error": "Empty body"}, 400)
            return
        if length > CHAT_MAX_BYTES:
            self.send_json({"ok": False, "error": "Chat payload too large (max 8 MB)"}, 413)
            return

        raw = self.rfile.read(length)
        content_type = self.headers.get("Content-Type", "")
        payload: dict = {}
        files: dict[str, tuple[str, bytes]] = {}
        if content_type.startswith("multipart/form-data"):
            payload, files = parse_multipart(raw, content_type)
        else:
            try:
                payload = json.loads(raw.decode("utf-8") or "{}")
            except json.JSONDecodeError:
                self.send_json({"ok": False, "error": "Invalid JSON"}, 400)
                return

        session_id = str(payload.get("sessionId") or "anon")[:80]
        message = str(payload.get("message") or payload.get("text") or "").strip()
        contact = str(payload.get("contact") or "").strip() or None
        history = payload.get("history") if isinstance(payload.get("history"), list) else []
        # Keep history compact
        history = [
            {"role": str(h.get("role") or "user"), "text": str(h.get("text") or "")[:2000]}
            for h in history[-12:]
            if isinstance(h, dict)
        ]

        try:
            if self.path == "/api/chat/escalate" or (
                self.path == "/api/chat" and editorial_agent.wants_operator(message)
            ):
                result = editorial_agent.create_operator_ticket(
                    data_root=DATA_ROOT,
                    message=message or "Запрос оператора из чата",
                    session_id=session_id,
                    contact=contact,
                    history=history,
                )
                self.send_json({"ok": True, "intent": "operator", **result})
                return

            if self.path == "/api/chat/check" or files.get("manuscript") or files.get("file"):
                field = "manuscript" if "manuscript" in files else "file"
                if field not in files and not payload.get("text"):
                    self.send_json(
                        {
                            "ok": False,
                            "error": "Attach a manuscript file or paste text",
                            "reply": "Прикрепите файл рукописи или вставьте текст для проверки.",
                        },
                        400,
                    )
                    return
                warnings: list[str] = []
                filename = None
                text = str(payload.get("text") or "")
                if field in files:
                    filename, content = files[field]
                    text, warnings = editorial_agent.extract_text_from_bytes(filename, content)
                analysis = editorial_agent.analyze_manuscript(
                    text, filename=filename, warnings=warnings
                )
                self.send_json({"ok": True, "intent": "manuscript_check", **analysis})
                return

            result = editorial_agent.handle_chat(
                message=message,
                session_id=session_id,
                history=history,
                contact=contact,
                data_root=DATA_ROOT,
                pasted_text=str(payload.get("text") or "") or None,
            )
            self.send_json(result)
        except Exception:
            log.exception("Chat agent failed")
            self.send_json(
                {
                    "ok": False,
                    "error": "Agent error",
                    "reply": "Временный сбой агента. Напишите на "
                    f"{editorial_agent.JOURNAL['contact_email']} или попробуйте позже.",
                },
                500,
            )

    def send_json(self, data: dict, status: int = 200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt: str, *args):
        log.info("%s - %s", self.address_string(), fmt % args)


def parse_multipart(raw: bytes, content_type: str):
    boundary = None
    for part in content_type.split(";"):
        part = part.strip()
        if part.startswith("boundary="):
            boundary = part.split("=", 1)[1].strip().strip('"')
    if not boundary:
        return {}, {}

    payload: dict = {}
    files: dict[str, tuple[str, bytes]] = {}
    delim = ("--" + boundary).encode()
    chunks = raw.split(delim)
    for chunk in chunks:
        if not chunk or chunk in (b"--\r\n", b"--", b"\r\n", b"--\r\n"):
            continue
        if chunk.startswith(b"\r\n"):
            chunk = chunk[2:]
        if chunk.endswith(b"\r\n"):
            chunk = chunk[:-2]
        if chunk == b"--":
            continue
        header_blob, _, body = chunk.partition(b"\r\n\r\n")
        if body.endswith(b"\r\n"):
            body = body[:-2]
        headers = header_blob.decode("utf-8", errors="replace").split("\r\n")
        disposition = next((h for h in headers if h.lower().startswith("content-disposition:")), "")
        name = None
        filename = None
        for token in disposition.split(";"):
            token = token.strip()
            if token.startswith("name="):
                name = token.split("=", 1)[1].strip('"')
            if token.startswith("filename="):
                filename = token.split("=", 1)[1].strip('"')
        if not name:
            continue
        if filename:
            files[name] = (filename, body)
        elif name == "payload":
            try:
                payload = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                payload = {"raw": body.decode("utf-8", errors="replace")}
        else:
            payload[name] = body.decode("utf-8", errors="replace")
    return payload, files


def main():
    # Migrate legacy ./inbox into private store once (if present).
    legacy = ROOT / "inbox"
    if legacy.is_dir() and any(legacy.iterdir()):
        for item in legacy.iterdir():
            if item.name == ".gitkeep":
                continue
            dest = INBOX / item.name
            if not dest.exists():
                item.rename(dest)
                log.info("Moved legacy inbox item -> %s", dest)

    port = int(os.environ.get("PORT", "5173"))
    host = os.environ.get("HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"BSM server -> http://127.0.0.1:{port}")
    print(f"LAN link (same WiFi) -> http://192.168.1.236:{port}")
    print(f"Bound {host}:{port}")
    print(f"Private inbox (NOT web-served) -> {INBOX}")
    print(f"Log file -> {LOG_PATH}")
    print(f"Editorial email target -> {EDITORIAL_EMAIL}")
    if SMTP_HOST:
        print(f"SMTP enabled -> {SMTP_HOST}:{SMTP_PORT}")
    else:
        print("SMTP not configured - packages saved under .private/inbox as .eml")
    configured = [p["id"] for p in auth_oauth.list_providers() if p["configured"]]
    print(
        "OAuth providers ready -> "
        + (", ".join(configured) if configured else "none (set keys in .env — see .env.example)")
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
