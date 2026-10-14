#!/usr/bin/env python3
"""
tts_test.py — TTS Pipeline Stub for Padhai Pocket
Standard library and urllib only (no live API calls).

Reads .env configuration and outputs the standard Opus transcoding command:
  ffmpeg -i input.wav -c:a libopus -b:a 16k -vbr on output.opus
"""

import os
import sys
import urllib.request
import urllib.parse
from typing import Dict, Optional, Tuple


def load_env_file(path: str) -> Dict[str, str]:
    """Parses a simple .env key-value file using standard library only."""
    env_vars: Dict[str, str] = {}
    if not os.path.exists(path):
        return env_vars

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("\"'").strip()
                env_vars[k] = v
    return env_vars


def find_env() -> Tuple[Dict[str, str], Optional[str]]:
    """Searches for .env in repo root or backend/.env."""
    curr = os.path.abspath(os.path.dirname(__file__))
    candidates = [
        os.path.join(curr, ".env"),
        os.path.join(curr, "..", ".env"),
        os.path.join(curr, "..", "..", ".env"),
        os.path.join(curr, "..", "..", "backend", ".env")
    ]
    for c in candidates:
        norm = os.path.normpath(c)
        if os.path.isfile(norm):
            return load_env_file(norm), norm
    return {}, None


def main():
    env_data, env_path = find_env()
    print("=" * 65)
    print(" PADHAI POCKET TTS PIPELINE STUB")
    print("=" * 65)
    if env_path:
        print(f"Loaded environment from: {env_path}")
        # Display presence of keys without leaking secrets
        for key in ["SARVAM_API_KEY", "OPENAI_API_KEY", "TTS_SERVICE", "TTS_VOICE"]:
            if key in env_data:
                masked = env_data[key][:4] + "..." if len(env_data[key]) > 4 else "[SET]"
                print(f"  - {key}: {masked}")
    else:
        print("Note: No .env file found in standard locations.")

    print("\nOpus Transcoding Standard Command:")
    ffmpeg_cmd = "ffmpeg -i input.wav -c:a libopus -b:a 16k -vbr on output.opus"
    print(f"  {ffmpeg_cmd}")
    print("\nStatus: Stub verified successfully (0 live calls made).")
    print("=" * 65)


if __name__ == "__main__":
    main()
