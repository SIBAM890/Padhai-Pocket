#!/usr/bin/env python3
"""
build_pack.py — Builds and cryptographically seals Padhai Pocket content packs.
Standard library Python only.

Computes canonical SHA-256 over pack contents, stamps UTC built_at,
updates content/motion_pack.json, and writes content/.build_manifest.json.

Usage:
  python content/tools/build_pack.py [--pack PATH] [--verify]
"""

import sys
import os
import json
import hashlib
import datetime
import argparse
import subprocess
from typing import Dict, Any, Tuple


def get_repo_root() -> str:
    """Resolves repo root via git rev-parse or upward directory traversal."""
    try:
        res = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        root = res.stdout.strip()
        if os.path.isdir(root):
            return root
    except Exception:
        pass

    curr = os.path.abspath(os.path.dirname(__file__))
    while curr and curr != os.path.dirname(curr):
        if os.path.exists(os.path.join(curr, ".git")) or os.path.exists(os.path.join(curr, "shared", "pack.schema.json")):
            return curr
        curr = os.path.dirname(curr)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def canonicalize_for_hash(pack: Dict[str, Any]) -> bytes:
    """
    Produces deterministic byte representation for SHA-256 computation.
    The self-referential hash fields (sha256, built_at) are normalized to empty strings.
    """
    copied = json.loads(json.dumps(pack))
    if "manifest" in copied and isinstance(copied["manifest"], dict):
        copied["manifest"]["sha256"] = ""
        copied["manifest"]["built_at"] = ""

    canonical_json = json.dumps(copied, sort_keys=True, ensure_ascii=False, indent=2)
    return canonical_json.encode("utf-8")


def compute_pack_hash(pack: Dict[str, Any]) -> str:
    """Computes SHA-256 hash of canonicalized pack content."""
    canonical_bytes = canonicalize_for_hash(pack)
    return hashlib.sha256(canonical_bytes).hexdigest()


def build_pack(pack_path: str, repo_root: str) -> Tuple[str, str]:
    """
    Builds and seals the content pack:
    1. Computes SHA-256.
    2. Records UTC timestamp.
    3. Writes content/.build_manifest.json.
    4. Injects sha256 and built_at into motion_pack.json.
    """
    if not os.path.exists(pack_path):
        print(f"ERROR: Pack file not found at: {pack_path}", file=sys.stderr)
        sys.exit(1)

    with open(pack_path, "r", encoding="utf-8") as f:
        pack_data = json.load(f)

    # Compute hash
    sha256_hash = compute_pack_hash(pack_data)
    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Prepare build record
    build_record = {
        "pack_file": os.path.relpath(pack_path, repo_root).replace("\\", "/"),
        "sha256": sha256_hash,
        "built_at": now_utc,
        "built_by": "build_pack.py",
        "pack_version": pack_data.get("pack_version", "1.0"),
        "chapter": pack_data.get("chapter", {}).get("chapter_no", "5"),
        "stats": {
            "chunks_count": len(pack_data.get("chunks", [])),
            "terms_count": len(pack_data.get("terms", [])),
            "items_count": len(pack_data.get("items", []))
        }
    }

    # 1. Write content/.build_manifest.json
    build_manifest_path = os.path.join(repo_root, "content", ".build_manifest.json")
    existing_packs = {}
    if os.path.exists(build_manifest_path):
        try:
            with open(build_manifest_path, "r", encoding="utf-8") as f:
                prev_record = json.load(f)
                existing_packs = prev_record.get("packs", {})
                if prev_record.get("pack_file") and prev_record.get("sha256"):
                    existing_packs[prev_record["pack_file"]] = prev_record["sha256"]
        except Exception:
            pass
    rel_pack = os.path.relpath(pack_path, repo_root).replace("\\", "/")
    existing_packs[rel_pack] = sha256_hash
    build_record["packs"] = existing_packs

    with open(build_manifest_path, "w", encoding="utf-8") as f:
        json.dump(build_record, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # 2. Update pack manifest
    if "manifest" not in pack_data or not isinstance(pack_data["manifest"], dict):
        pack_data["manifest"] = {}
    pack_data["manifest"]["sha256"] = sha256_hash
    pack_data["manifest"]["built_at"] = now_utc

    with open(pack_path, "w", encoding="utf-8") as f:
        json.dump(pack_data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    return sha256_hash, now_utc


def verify_pack(pack_path: str, repo_root: str) -> bool:
    """Verifies that pack's sha256 matches both its content and .build_manifest.json."""
    build_manifest_path = os.path.join(repo_root, "content", ".build_manifest.json")
    if not os.path.exists(build_manifest_path):
        print("FAIL: .build_manifest.json does not exist. Pack has not been built.")
        return False

    with open(build_manifest_path, "r", encoding="utf-8") as f:
        build_record = json.load(f)

    with open(pack_path, "r", encoding="utf-8") as f:
        pack_data = json.load(f)

    computed_hash = compute_pack_hash(pack_data)
    manifest_hash = pack_data.get("manifest", {}).get("sha256", "")
    record_hash = build_record.get("sha256", "")

    print(f"Computed SHA-256: {computed_hash}")
    print(f"Manifest SHA-256: {manifest_hash}")
    print(f"Record SHA-256  : {record_hash}")

    if computed_hash == manifest_hash == record_hash:
        print("VERIFICATION SUCCESS: Pack integrity verified.")
        return True
    else:
        print("VERIFICATION FAILURE: Hash mismatch detected.")
        return False


def main():
    parser = argparse.ArgumentParser(description="Padhai Pocket Content Pack Builder & Sealer")
    parser.add_argument("--pack", type=str, default=None, help="Path to motion_pack.json")
    parser.add_argument("--verify", action="store_true", help="Verify pack integrity without rebuilding")

    args = parser.parse_args()
    repo_root = get_repo_root()
    pack_path = args.pack or os.path.join(repo_root, "content", "motion_pack.json")

    if args.verify:
        success = verify_pack(pack_path, repo_root)
        sys.exit(0 if success else 1)

    print("=" * 65)
    print(" PADHAI POCKET CONTENT PACK BUILDER")
    print("=" * 65)
    print(f"Repo Root  : {repo_root}")
    print(f"Pack Path  : {pack_path}")

    sha256_hash, built_at = build_pack(pack_path, repo_root)

    print("-" * 65)
    print(" BUILD SUCCESSFUL")
    print(f"  SHA-256   : {sha256_hash}")
    print(f"  Built At  : {built_at}")
    print(f"  Record    : content/.build_manifest.json")
    print("=" * 65)


if __name__ == "__main__":
    main()
