#!/usr/bin/env python3
"""
hash_prompts.py — Calculates real SHA-256 over canonical prompt strings.
Phase 4 Deliverable (Item 7)
Standard library only.
"""

import sys
import os
import hashlib

# Add repo root to sys.path so content.prompts can be imported
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

try:
    from content.prompts.prompts import (
        PROMPT_VERSION,
        MODEL_ID,
        get_all_prompt_strings
    )
except ImportError as e:
    print(f"ERROR: Failed to import prompts module: {e}", file=sys.stderr)
    sys.exit(1)


def compute_prompts_hash() -> str:
    """Computes SHA-256 hash over concatenated canonical prompt strings."""
    prompt_strings = get_all_prompt_strings()
    concatenated = "\n---PROMPT_DELIMITER---\n".join(prompt_strings).encode("utf-8")
    hasher = hashlib.sha256()
    hasher.update(concatenated)
    return hasher.hexdigest()


def main():
    h = compute_prompts_hash()
    print("=" * 65)
    print(" PADHAI POCKET PROMPT INTEGRITY MANIFEST")
    print("=" * 65)
    print(f"Prompt Version : {PROMPT_VERSION}")
    print(f"Model ID       : {MODEL_ID}")
    print(f"SHA-256 Hash   : {h}")
    print("=" * 65)


if __name__ == "__main__":
    main()
