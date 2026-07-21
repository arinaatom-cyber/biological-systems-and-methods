"""OAuth providers: Google, Yandex, Mail.ru, ORCID.

Secrets come from environment variables — never invent or fake a successful login
when client credentials are missing.
"""

from __future__ import annotations

import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

DATA_ROOT = Path(os.environ.get("BS_DATA_DIR", str(Path(__file__).resolve().parent / ".private")))
SESSIONS = DATA_ROOT / "sessions"
OAUTH_STATES = DATA_ROOT / "oauth_states"
SESSIONS.mkdir(parents=True, exist_ok=True)
OAUTH_STATES.mkdir(parents=True, exist_ok=True)

PUBLIC_BASE = os.environ.get("BS_PUBLIC_BASE", "http://127.0.0.1:5173").rstrip("/")
SESSION_TTL = 60 * 60 * 24 * 14  # 14 days
STATE_TTL = 600  # 10 minutes

PROVIDERS: dict[str, dict[str, Any]] = {
    "yandex": {
        "id": "yandex",
        "label": "Yandex",
        "labelRu": "Яндекс",
        "authorize": "https://oauth.yandex.ru/authorize",
        "token": "https://oauth.yandex.ru/token",
        "userinfo": "https://login.yandex.ru/info?format=json",
        "scope": "login:email login:info",
        "client_id_env": "BS_OAUTH_YANDEX_CLIENT_ID",
        "client_secret_env": "BS_OAUTH_YANDEX_CLIENT_SECRET",
    },
    "mailru": {
        "id": "mailru",
        "label": "Mail.ru",
        "labelRu": "Mail.ru",
        "authorize": "https://oauth.mail.ru/login",
        "token": "https://oauth.mail.ru/token",
        "userinfo": "https://oauth.mail.ru/userinfo",
        "scope": "userinfo",
        "client_id_env": "BS_OAUTH_MAILRU_CLIENT_ID",
        "client_secret_env": "BS_OAUTH_MAILRU_CLIENT_SECRET",
    },
    "google": {
        "id": "google",
        "label": "Gmail / Google",
        "labelRu": "Gmail / Google",
        "authorize": "https://accounts.google.com/o/oauth2/v2/auth",
        "token": "https://oauth2.googleapis.com/token",
        "userinfo": "https://openidconnect.googleapis.com/v1/userinfo",
        "scope": "openid email profile",
        "client_id_env": "BS_OAUTH_GOOGLE_CLIENT_ID",
        "client_secret_env": "BS_OAUTH_GOOGLE_CLIENT_SECRET",
    },
    "orcid": {
        "id": "orcid",
        "label": "ORCID",
        "labelRu": "ORCID",
        "authorize": "https://orcid.org/oauth/authorize",
        "token": "https://orcid.org/oauth/token",
        "userinfo": None,
        "scope": "/authenticate openid",
        "client_id_env": "BS_OAUTH_ORCID_CLIENT_ID",
        "client_secret_env": "BS_OAUTH_ORCID_CLIENT_SECRET",
    },
}


def _env(name: str) -> str:
    return (os.environ.get(name) or "").strip()


def provider_status(pid: str) -> dict[str, Any]:
    meta = PROVIDERS[pid]
    client_id = _env(meta["client_id_env"])
    client_secret = _env(meta["client_secret_env"])
    configured = bool(client_id and client_secret)
    return {
        "id": pid,
        "label": meta["label"],
        "labelRu": meta["labelRu"],
        "configured": configured,
        "loginUrl": f"/api/auth/login/{pid}" if configured else None,
    }


def list_providers() -> list[dict[str, Any]]:
    return [provider_status(pid) for pid in PROVIDERS]


def redirect_uri(pid: str) -> str:
    return f"{PUBLIC_BASE}/api/auth/callback/{pid}"


def build_authorize_url(pid: str) -> tuple[str | None, str | None]:
    if pid not in PROVIDERS:
        return None, "unknown_provider"
    status = provider_status(pid)
    if not status["configured"]:
        return None, "not_configured"
    meta = PROVIDERS[pid]
    state = secrets.token_urlsafe(24)
    (OAUTH_STATES / f"{state}.json").write_text(
        json.dumps({"provider": pid, "exp": time.time() + STATE_TTL}, ensure_ascii=False),
        encoding="utf-8",
    )
    params = {
        "client_id": _env(meta["client_id_env"]),
        "response_type": "code",
        "redirect_uri": redirect_uri(pid),
        "scope": meta["scope"],
        "state": state,
    }
    if pid == "google":
        params["access_type"] = "online"
        params["prompt"] = "select_account"
    if pid == "orcid":
        params["scope"] = "/authenticate"
    return f"{meta['authorize']}?{urllib.parse.urlencode(params)}", None


def _pop_state(state: str) -> dict[str, Any] | None:
    path = OAUTH_STATES / f"{state}.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    finally:
        try:
            path.unlink()
        except OSError:
            pass
    if float(data.get("exp") or 0) < time.time():
        return None
    return data


def _http_json(method: str, url: str, data: dict | None = None, headers: dict | None = None) -> dict:
    body = None
    hdrs = {"Accept": "application/json", "User-Agent": "BiologicalSciencesJournal/1.0"}
    if headers:
        hdrs.update(headers)
    if data is not None:
        body = urllib.parse.urlencode(data).encode("utf-8")
        hdrs["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    with urllib.request.urlopen(req, timeout=25) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw or "{}")


def exchange_code(pid: str, code: str) -> dict[str, Any]:
    meta = PROVIDERS[pid]
    token = _http_json(
        "POST",
        meta["token"],
        {
            "client_id": _env(meta["client_id_env"]),
            "client_secret": _env(meta["client_secret_env"]),
            "code": code,
            "redirect_uri": redirect_uri(pid),
            "grant_type": "authorization_code",
        },
    )
    access = token.get("access_token")
    if not access:
        raise RuntimeError("no_access_token")

    profile: dict[str, Any] = {
        "provider": pid,
        "accessTokenPresent": True,
    }

    if pid == "orcid":
        orcid = token.get("orcid") or ""
        name = token.get("name") or ""
        profile.update(
            {
                "id": orcid,
                "orcid": orcid,
                "name": name,
                "email": None,
            }
        )
        return profile

    if pid == "google":
        info = _http_json("GET", meta["userinfo"], headers={"Authorization": f"Bearer {access}"})
        profile.update(
            {
                "id": info.get("sub"),
                "email": info.get("email"),
                "name": info.get("name") or info.get("email"),
                "picture": info.get("picture"),
            }
        )
        return profile

    if pid == "yandex":
        info = _http_json("GET", meta["userinfo"], headers={"Authorization": f"OAuth {access}"})
        emails = info.get("emails") or []
        profile.update(
            {
                "id": str(info.get("id") or info.get("uid") or ""),
                "email": info.get("default_email") or (emails[0] if emails else None),
                "name": info.get("real_name") or info.get("display_name") or info.get("login"),
            }
        )
        return profile

    if pid == "mailru":
        info = _http_json(
            "GET",
            f"{meta['userinfo']}?{urllib.parse.urlencode({'access_token': access})}",
        )
        profile.update(
            {
                "id": str(info.get("id") or info.get("email") or ""),
                "email": info.get("email"),
                "name": " ".join(
                    x for x in [info.get("first_name"), info.get("last_name")] if x
                ).strip()
                or info.get("nickname")
                or info.get("email"),
            }
        )
        return profile

    raise RuntimeError("unsupported_provider")


def create_session(profile: dict[str, Any]) -> str:
    token = secrets.token_urlsafe(32)
    record = {
        "token": token,
        "createdAt": time.time(),
        "exp": time.time() + SESSION_TTL,
        "user": {
            "provider": profile.get("provider"),
            "id": profile.get("id"),
            "email": profile.get("email"),
            "name": profile.get("name"),
            "orcid": profile.get("orcid"),
            "picture": profile.get("picture"),
        },
    }
    (SESSIONS / f"{token}.json").write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return token


def get_session(token: str | None) -> dict[str, Any] | None:
    if not token:
        return None
    path = SESSIONS / f"{token}.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    if float(data.get("exp") or 0) < time.time():
        try:
            path.unlink()
        except OSError:
            pass
        return None
    return data.get("user")


def destroy_session(token: str | None) -> None:
    if not token:
        return
    path = SESSIONS / f"{token}.json"
    try:
        path.unlink()
    except OSError:
        pass


def handle_callback(pid: str, query: dict[str, list[str]]) -> tuple[str, str | None]:
    """Returns (redirect_path, session_token_or_none)."""
    err = (query.get("error") or [None])[0]
    if err:
        return f"/login.html?error={urllib.parse.quote(err)}", None
    code = (query.get("code") or [None])[0]
    state = (query.get("state") or [None])[0]
    if not code or not state:
        return "/login.html?error=missing_code", None
    st = _pop_state(state)
    if not st or st.get("provider") != pid:
        return "/login.html?error=invalid_state", None
    if not provider_status(pid)["configured"]:
        return "/login.html?error=not_configured", None
    try:
        profile = exchange_code(pid, code)
        token = create_session(profile)
        return "/account.html?login=ok", token
    except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError, json.JSONDecodeError) as exc:
        return f"/login.html?error={urllib.parse.quote(str(exc)[:80])}", None
