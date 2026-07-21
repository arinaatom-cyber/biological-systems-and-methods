"""Smoke-test /api/submit after P0 hardening."""
import json
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
boundary = "----BSHardenedBoundary"


def post(payload: dict, files: dict[str, tuple[str, bytes]]):
    parts = []

    def add(name, value, filename=None, ctype=None):
        header = [f"--{boundary}", f'Content-Disposition: form-data; name="{name}"']
        if filename:
            header[1] += f'; filename="{filename}"'
            if ctype:
                header.append(f"Content-Type: {ctype}")
            header.append("")
            parts.append("\r\n".join(header).encode() + b"\r\n" + value + b"\r\n")
        else:
            header.append("")
            header.append(value)
            parts.append("\r\n".join(header).encode() + b"\r\n")

    add("payload", json.dumps(payload))
    for key, (fname, content) in files.items():
        add(key, content, fname, "application/pdf")
    body = b"".join(parts) + f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        "http://127.0.0.1:5173/api/submit",
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req, timeout=10) as res:
        return res.status, json.loads(res.read().decode())


def expect_fail(payload, files):
    try:
        post(payload, files)
        raise SystemExit("expected 400")
    except urllib.error.HTTPError as e:
        print("reject OK", e.code, e.read().decode()[:200])


good_payload = {
    "submissionId": "BS-HARDEN-OK",
    "title": "Hardened upload validation test manuscript",
    "correspondingEmail": "author@example.edu",
    "keywords": ["a", "b", "c"],
}
good_files = {"manuscript": ("paper.pdf", b"%PDF-1.4 valid test")}

print("good:", post(good_payload, good_files))
expect_fail({**good_payload, "title": "x"}, good_files)
expect_fail(good_payload, {"manuscript": ("evil.exe", b"MZ")})

# inbox must not be web-readable
try:
    urllib.request.urlopen("http://127.0.0.1:5173/inbox/", timeout=5)
    raise SystemExit("inbox should be 404")
except urllib.error.HTTPError as e:
    print("inbox blocked OK", e.code)

print("private dir exists:", (ROOT / ".private" / "inbox").exists())
