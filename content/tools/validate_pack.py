#!/usr/bin/env python3
"""
validate_pack.py — Content Pack Validator v3 for Padhai Pocket
Standard library Python only (no external dependencies).

Two verdicts are always printed:
  LOCAL RULES: ok/fail      OFFICIAL SCHEMA (shared/pack.schema.json): ok/fail

Usage:
  python content/tools/validate_pack.py [--pack PATH] [--schema PATH] [--audio-manifest PATH] [--strict]
"""

import sys
import os
import json
import csv
import re
import argparse
import subprocess
from typing import Dict, Any, List, Tuple, Set, Optional


CHUNK_PATTERN_STANDARD = re.compile(r"^BSE9-[A-Z]+-[A-Z]+-S\d{2}$")
CHUNK_PATTERN_EXTENDED = re.compile(r"^BSE9-[A-Z]+-[A-Z]+-S\d{2}-\d{2}$")

VALID_STATUSES = {"draft", "reviewed", "approved", "demo_approved"}
VALID_MODALITIES = {"P", "A", "T", "W", "TX", "PX", "MCQ"}
FORBIDDEN_CHILD_WORDS = [r"\bwrong\b", r"\bgap\b", r"\bdiagnosis\b"]
MEDIA_REF_PATTERN = re.compile(r"(\.(png|jpg|jpeg|svg|opus|m4a|mp3|wav|webp)$|^media:|^audio:|^image:|^img_)", re.IGNORECASE)
FORBIDDEN_EMPTY_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"


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
        if os.path.exists(os.path.join(curr, ".git")):
            return curr
        curr = os.path.dirname(curr)

    return os.getcwd()


# ==============================================================================
# OFFICIAL SCHEMA VALIDATOR (Minimal JSON Schema subset in stdlib)
# ==============================================================================

SUPPORTED_SCHEMA_KEYWORDS = {
    "type", "required", "properties", "additionalProperties",
    "enum", "pattern", "items", "minimum", "minItems", "maxItems",
    "$schema", "title", "description"
}

def validate_json_schema(data: Any, schema: Dict[str, Any], path: str = "$") -> Tuple[List[str], List[str]]:
    """
    Validates data against a JSON schema dict.
    Returns: (errors, unsupported_keywords_reported)
    """
    errors: List[str] = []
    unsupported: List[str] = []

    if not isinstance(schema, dict):
        return errors, unsupported

    # Check for unsupported keywords
    for k in schema.keys():
        if k not in SUPPORTED_SCHEMA_KEYWORDS:
            unsupported.append(f"Unsupported schema keyword at {path}: '{k}'")

    # 1. Type validation
    expected_type = schema.get("type")
    if expected_type:
        type_map = {
            "object": dict,
            "array": list,
            "string": str,
            "integer": int,
            "number": (int, float),
            "boolean": bool,
            "null": type(None)
        }
        if isinstance(expected_type, list):
            valid = any(
                isinstance(data, type_map[t]) and (t != "integer" or not isinstance(data, bool))
                for t in expected_type if t in type_map
            )
            if not valid:
                errors.append(f"{path}: expected one of types {expected_type}, got {type(data).__name__}")
                return errors, unsupported
        elif expected_type in type_map:
            if expected_type == "integer" and isinstance(data, bool):
                errors.append(f"{path}: expected integer, got bool")
                return errors, unsupported
            if not isinstance(data, type_map[expected_type]):
                errors.append(f"{path}: expected {expected_type}, got {type(data).__name__}")
                return errors, unsupported

    # 2. Enum validation
    if "enum" in schema:
        allowed_enum = schema["enum"]
        if data not in allowed_enum:
            errors.append(f"{path}: value {repr(data)} not in enum {allowed_enum}")

    # 3. Pattern validation (for strings)
    if "pattern" in schema and isinstance(data, str):
        pat = schema["pattern"]
        if not re.search(pat, data):
            errors.append(f"{path}: string {repr(data)} does not match pattern {pat}")

    # 4. Minimum validation (for numbers)
    if "minimum" in schema and isinstance(data, (int, float)) and not isinstance(data, bool):
        min_val = schema["minimum"]
        if data < min_val:
            errors.append(f"{path}: value {data} is less than minimum {min_val}")

    # 5. Object validation
    if isinstance(data, dict):
        required = schema.get("required", [])
        for req in required:
            if req not in data:
                errors.append(f"{path}: missing required property '{req}'")

        props = schema.get("properties", {})
        add_props = schema.get("additionalProperties", True)
        if add_props is False:
            for k in data.keys():
                if k not in props:
                    errors.append(f"{path}: additional property '{k}' not allowed")

        for k, v in data.items():
            if k in props:
                sub_errs, sub_unsup = validate_json_schema(v, props[k], f"{path}.{k}")
                errors.extend(sub_errs)
                unsupported.extend(sub_unsup)

    # 6. Array validation
    if isinstance(data, list):
        if "minItems" in schema and len(data) < schema["minItems"]:
            errors.append(f"{path}: array has {len(data)} items, minimum is {schema['minItems']}")
        if "maxItems" in schema and len(data) > schema["maxItems"]:
            errors.append(f"{path}: array has {len(data)} items, maximum is {schema['maxItems']}")
        if "items" in schema:
            for idx, item in enumerate(data):
                sub_errs, sub_unsup = validate_json_schema(item, schema["items"], f"{path}[{idx}]")
                errors.extend(sub_errs)
                unsupported.extend(sub_unsup)

    return errors, unsupported


# ==============================================================================
# LOCAL RULES VALIDATOR
# ==============================================================================

def load_audio_manifest(manifest_path: str) -> Tuple[Set[str], Dict[str, str]]:
    """Loads audio manifest CSV returning set of item_ids and status dict."""
    manifest_ids: Set[str] = set()
    manifest_statuses: Dict[str, str] = {}
    if not os.path.exists(manifest_path):
        return manifest_ids, manifest_statuses

    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                iid = row.get("item_id", "").strip()
                if iid:
                    manifest_ids.add(iid)
                    s_val = row.get("status") or row.get("status(needed|generated|reviewed)") or "needed"
                    manifest_statuses[iid] = s_val.strip()
    except Exception:
        pass
    return manifest_ids, manifest_statuses


def load_review_log(log_path: str) -> Set[Tuple[str, str]]:
    """Loads review_log.csv returning set of (id, reviewer)."""
    reviewed_records: Set[Tuple[str, str]] = set()
    if not os.path.exists(log_path):
        return reviewed_records

    try:
        with open(log_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rec_id = (row.get("item_or_clip_id") or row.get("id") or row.get("chunk_id") or row.get("item_id") or "").strip()
                reviewer = (row.get("reviewer") or row.get("reviewed_by") or "").strip()
                dt = (row.get("date") or "").strip()
                if rec_id and reviewer and dt:
                    reviewed_records.add((rec_id, reviewer))
    except Exception:
        pass
    return reviewed_records


def load_transcript_texts(transcripts_dir: str) -> Tuple[str, str]:
    """Loads all text content from active transcripts and section_map.md."""
    combined_transcripts = ""
    section_map_text = ""

    if not os.path.isdir(transcripts_dir):
        return combined_transcripts, section_map_text

    for fname in os.listdir(transcripts_dir):
        p = os.path.join(transcripts_dir, fname)
        if os.path.isfile(p):
            if fname == "section_map.md":
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        section_map_text = f.read()
                except Exception:
                    pass
            elif fname.endswith(".txt") or fname.endswith(".md"):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        combined_transcripts += "\n" + f.read()
                except Exception:
                    pass

    return combined_transcripts, section_map_text


def find_placeholders(obj: Any, path: str = "") -> List[Tuple[str, str]]:
    """Recursively finds placeholders [[...]] or [VERIFY...] with JSON path."""
    found: List[Tuple[str, str]] = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            curr_path = f"{path}.{k}" if path else k
            found.extend(find_placeholders(v, curr_path))
    elif isinstance(obj, list):
        for idx, item in enumerate(obj):
            curr_path = f"{path}[{idx}]"
            found.extend(find_placeholders(item, curr_path))
    elif isinstance(obj, str):
        if "[[" in obj and "]]" in obj:
            found.append((path, obj))
        elif "[VERIFY" in obj:
            found.append((path, obj))
    return found


def is_placeholder(val: str) -> bool:
    if not isinstance(val, str):
        return False
    val_s = val.strip()
    return (val_s.startswith("[[") and val_s.endswith("]]")) or ("[VERIFY" in val_s)


def contains_odia(s: str) -> bool:
    return any(0x0B00 <= ord(c) <= 0x0B7F for c in s)


def validate_local_rules(
    pack: Dict[str, Any],
    repo_root: str,
    audio_manifest_ids: Set[str],
    review_records: Set[Tuple[str, str]],
    transcripts_corpus: str,
    section_map_corpus: str
) -> Tuple[List[str], List[str], Dict[str, Any]]:
    """
    Validates content pack against local engineering & PRD rules.
    Returns: (errors, warnings, summary_stats)
    """
    errors: List[str] = []
    warnings: List[str] = []

    stats: Dict[str, Any] = {
        "modalities": {},
        "statuses": {},
        "placeholders_count": 0,
        "set_a_items": {},
        "set_b_items": {},
    }

    # 1. Required top-level fields
    required_top = ["pack_version", "manifest", "chapter", "chunks", "terms", "items"]
    for rk in required_top:
        if rk not in pack:
            errors.append(f"Missing required top-level field: '{rk}'")

    if errors:
        return errors, warnings, stats

    # 2. Manifest validation
    manifest = pack.get("manifest")
    if not isinstance(manifest, dict):
        errors.append("Field 'manifest' must be an object")
    else:
        for mf in ["sha256", "built_at"]:
            if mf not in manifest:
                errors.append(f"Manifest missing required field: '{mf}'")

        sha256_val = manifest.get("sha256", "")
        if sha256_val == FORBIDDEN_EMPTY_HASH:
            errors.append(f"manifest.sha256 is equal to forbidden empty-input hash: '{FORBIDDEN_EMPTY_HASH}'")
        elif sha256_val != "" and not is_placeholder(sha256_val):
            # Non-empty sha256 without build script run
            build_record_path = os.path.join(repo_root, "content", ".build_manifest.json")
            if not os.path.exists(build_record_path):
                errors.append(f"manifest.sha256 is non-empty ('{sha256_val}') without an approved build script run")

    # 3. Chapter validation
    chapter = pack.get("chapter")
    if not isinstance(chapter, dict):
        errors.append("Field 'chapter' must be an object")
    else:
        for cf in ["subject", "class", "chapter_no"]:
            if cf not in chapter:
                errors.append(f"Chapter missing required field: '{cf}'")
        if chapter.get("class") != 9:
            errors.append(f"Chapter 'class' must be 9, got: {chapter.get('class')}")

    # 4. Terms collection
    terms = pack.get("terms")
    terms_map: Dict[str, Dict[str, Any]] = {}
    if not isinstance(terms, list):
        errors.append("Field 'terms' must be a list")
    else:
        for idx, term in enumerate(terms):
            if not isinstance(term, dict):
                errors.append(f"Term at index {idx} must be an object")
                continue
            tid = term.get("term_id")
            if not tid:
                errors.append(f"Term at index {idx} missing 'term_id'")
                continue
            if tid in terms_map:
                errors.append(f"Duplicate term_id '{tid}' in terms[]")
            terms_map[tid] = term

            for req_tf in ["term_id", "en", "odia_from_textbook", "kui"]:
                if req_tf not in term:
                    errors.append(f"Term '{tid}' missing required field: '{req_tf}'")

            t_status = term.get("status")
            if t_status == "approved":
                errors.append(f"Term '{tid}' has forbidden status 'approved' (must be set by hand)")

            kui = term.get("kui", {})
            if (isinstance(kui, dict) and kui.get("status") == "pending") or t_status == "pending":
                warnings.append(f"Term '{tid}' has Kui status 'pending'")

            # Odia text provenance
            odia_val = term.get("odia_from_textbook", "")
            if isinstance(odia_val, str) and not is_placeholder(odia_val) and contains_odia(odia_val):
                if odia_val not in transcripts_corpus:
                    errors.append(f"Term '{tid}' odia_from_textbook '{odia_val}' not found in active transcripts")

    # 5. Chunks collection
    chunks = pack.get("chunks")
    seen_chunk_ids: Set[str] = set()
    source_pages: List[int] = []

    if not isinstance(chunks, list):
        errors.append("Field 'chunks' must be a list")
    else:
        for idx, chunk in enumerate(chunks):
            if not isinstance(chunk, dict):
                errors.append(f"Chunk at index {idx} must be an object")
                continue
            cid = chunk.get("chunk_id", "")
            if not cid:
                errors.append(f"Chunk at index {idx} missing 'chunk_id'")
                continue

            if cid in seen_chunk_ids:
                errors.append(f"Duplicate chunk_id: '{cid}'")
            seen_chunk_ids.add(cid)

            # Chunk ID patterns
            if CHUNK_PATTERN_STANDARD.match(cid):
                pass
            elif CHUNK_PATTERN_EXTENDED.match(cid):
                warnings.append(f"chunk_id form unconfirmed with Sibam: '{cid}'")
            else:
                errors.append(f"Chunk '{cid}' does not match allowed chunk_id patterns")

            # Status validation
            c_status = chunk.get("status")
            if c_status not in VALID_STATUSES:
                errors.append(f"Chunk '{cid}' status '{c_status}' outside valid statuses {VALID_STATUSES}")
            elif c_status == "approved":
                errors.append(f"Chunk '{cid}' has forbidden status 'approved' (must be set by hand after native review)")

            stats["statuses"][c_status] = stats["statuses"].get(c_status, 0) + 1

            # reviewed_by check
            reviewed_by_val = chunk.get("reviewed_by", "")
            if not reviewed_by_val:
                warnings.append(f"Chunk '{cid}' has empty 'reviewed_by'")
            else:
                if (cid, reviewed_by_val) not in review_records:
                    errors.append(f"Chunk '{cid}' reviewed_by '{reviewed_by_val}' has no matching entry in content/review_log.csv")

            # Required fields in chunk
            for req_cf in ["title_or", "odia_text", "terms", "source_page", "status", "reviewed_by"]:
                if req_cf not in chunk:
                    errors.append(f"Chunk '{cid}' missing required field: '{req_cf}'")

            # Terms cross-reference
            chunk_terms = chunk.get("terms", [])
            if isinstance(chunk_terms, list):
                for ct in chunk_terms:
                    if ct not in terms_map:
                        errors.append(f"Chunk '{cid}' uses term_id '{ct}' which is missing from terms[]")

            # Source page collection
            sp = chunk.get("source_page")
            if isinstance(sp, int):
                source_pages.append(sp)

            # Chunk title check against section_map.md
            title_or = chunk.get("title_or", "")
            if isinstance(title_or, str) and not is_placeholder(title_or):
                if not section_map_corpus or title_or not in section_map_corpus:
                    errors.append(f"Chunk '{cid}' title_or '{title_or}' not found verbatim in section_map.md")

            # Chunk Odia text provenance
            odia_text = chunk.get("odia_text", "")
            if isinstance(odia_text, str) and not is_placeholder(odia_text) and contains_odia(odia_text):
                if odia_text not in transcripts_corpus:
                    sample = odia_text[:30] + "..." if len(odia_text) > 30 else odia_text
                    errors.append(f"Chunk '{cid}' odia_text ('{sample}') not found in active transcripts")

            # Child safety check
            for tf in ["title_or", "odia_text"]:
                t_val = chunk.get(tf, "")
                if isinstance(t_val, str):
                    for fw in FORBIDDEN_CHILD_WORDS:
                        if re.search(fw, t_val, re.IGNORECASE):
                            errors.append(f"Child safety violation in chunk '{cid}' field '{tf}': contains '{fw}'")

        # Check identical source pages
        if len(source_pages) > 1 and len(set(source_pages)) == 1:
            warnings.append(f"All chunks share identical source_page: {source_pages[0]}")

    # 6. Items collection
    items = pack.get("items")
    seen_item_ids: Set[str] = set()
    set_a_stems: Dict[str, str] = {}
    set_b_stems: Dict[str, str] = {}

    if not isinstance(items, list):
        errors.append("Field 'items' must be a list")
    else:
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                errors.append(f"Item at index {idx} must be an object")
                continue
            iid = item.get("item_id", "")
            if not iid:
                errors.append(f"Item at index {idx} missing 'item_id'")
                continue

            if iid in seen_item_ids:
                errors.append(f"Duplicate item_id: '{iid}'")
            seen_item_ids.add(iid)

            for req_if in ["item_id", "concept_id", "set", "modality", "stem", "options", "correct"]:
                if req_if not in item:
                    errors.append(f"Item '{iid}' missing required field: '{req_if}'")

            # Status validation (if present)
            i_status = item.get("status")
            if i_status:
                if i_status not in VALID_STATUSES:
                    errors.append(f"Item '{iid}' status '{i_status}' outside valid statuses {VALID_STATUSES}")
                elif i_status == "approved":
                    errors.append(f"Item '{iid}' has forbidden status 'approved' (must be set by hand)")
                stats["statuses"][i_status] = stats["statuses"].get(i_status, 0) + 1

            # Modality validation
            modality = item.get("modality", "")
            if modality not in VALID_MODALITIES:
                errors.append(f"Item '{iid}' modality '{modality}' outside valid modalities {VALID_MODALITIES}")
            stats["modalities"][modality] = stats["modalities"].get(modality, 0) + 1

            # Options count: exactly 4
            options = item.get("options", [])
            if not isinstance(options, list) or len(options) != 4:
                errors.append(f"Item '{iid}' must have exactly 4 options (guess rate 0.25). Found: {len(options) if isinstance(options, list) else 'non-list'}")

            # Correct index: 0..3
            correct = item.get("correct")
            if not isinstance(correct, int) or correct < 0 or correct >= 4:
                errors.append(f"Item '{iid}' correct index must be integer 0..3, got: {correct}")

            # A-modality options must be media refs, NEVER plain text
            if modality == "A" and isinstance(options, list):
                for opt_idx, opt in enumerate(options):
                    if not isinstance(opt, str) or not MEDIA_REF_PATTERN.search(opt.strip()):
                        errors.append(f"A-modality item '{iid}' option {opt_idx} ('{opt}') is plain text. A-modality options must be media references, not text")

            # Audio reference check
            audio_ref = item.get("audio") or item.get("audio_file")
            if audio_ref and not is_placeholder(audio_ref):
                lookup_id = iid
                if audio_manifest_ids and lookup_id not in audio_manifest_ids and audio_ref not in audio_manifest_ids:
                    errors.append(f"Item '{iid}' references audio '{audio_ref}' but is absent from audio manifest")

            # Image reference check
            image_ref = item.get("image") or item.get("image_file")
            if image_ref and not is_placeholder(image_ref):
                image_disk_path = os.path.join(repo_root, "content", "images", os.path.basename(image_ref))
                if not os.path.exists(image_disk_path):
                    errors.append(f"Item '{iid}' references image file that does not exist: '{image_disk_path}'")

            # Child safety check
            stem = item.get("stem", "")
            if isinstance(stem, str):
                for fw in FORBIDDEN_CHILD_WORDS:
                    if re.search(fw, stem, re.IGNORECASE):
                        errors.append(f"Child safety violation in item '{iid}' stem: contains '{fw}'")

            # Parallel items check
            item_set = item.get("set")
            concept = item.get("concept_id")
            key = f"{concept}:{modality}"
            if item_set == "A":
                set_a_stems[key] = stem
            elif item_set == "B":
                set_b_stems[key] = stem
                if key in set_a_stems and set_a_stems[key] and set_a_stems[key] == stem and not is_placeholder(stem):
                    warnings.append(f"Set B item '{iid}' has stem identical to Set A for '{key}' (violates parallel-not-identical rule)")

    # 7. Check for placeholders
    placeholders = find_placeholders(pack)
    stats["placeholders_count"] = len(placeholders)
    for p_path, p_val in placeholders:
        warnings.append(f"Placeholder in '{p_path}': '{p_val}'")

    return errors, warnings, stats


def print_summary_table(
    stats: Dict[str, Any],
    manifest_statuses: Dict[str, str],
    local_errors_count: int,
    schema_errors_count: int,
    warnings_count: int
):
    """Prints formatted summary table."""
    print("\n" + "=" * 65)
    print(" CONTENT PACK VALIDATION SUMMARY")
    print("=" * 65)

    print("\nItems by Modality:")
    if stats["modalities"]:
        for m, count in sorted(stats["modalities"].items()):
            print(f"  - {m:5s}: {count:3d}")
    else:
        print("  (None)")

    print("\nStatuses (Chunks & Items):")
    if stats["statuses"]:
        for s, count in sorted(stats["statuses"].items()):
            print(f"  - {s:14s}: {count:3d}")
    else:
        print("  (None)")

    print(f"\nPlaceholders Remaining: {stats['placeholders_count']}")

    audio_needed = sum(1 for s in manifest_statuses.values() if s == "needed")
    audio_generated = sum(1 for s in manifest_statuses.values() if s == "generated")
    audio_reviewed = sum(1 for s in manifest_statuses.values() if s == "reviewed")
    print("\nAudio Clips Status:")
    print(f"  - Needed    : {audio_needed:3d}")
    print(f"  - Generated : {audio_generated:3d}")
    print(f"  - Reviewed  : {audio_reviewed:3d}")
    print(f"  - Total     : {len(manifest_statuses):3d}")

    print("\nValidation Result:")
    print(f"  Local Rule Errors: {local_errors_count}")
    print(f"  Schema Errors    : {schema_errors_count}")
    print(f"  Warnings         : {warnings_count}")
    print("=" * 65 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Padhai Pocket Content Pack Validator v3")
    parser.add_argument("--pack", type=str, default=None, help="Path to motion_pack.json")
    parser.add_argument("--schema", type=str, default=None, help="Path to pack.schema.json")
    parser.add_argument("--audio-manifest", type=str, default=None, help="Path to audio_manifest.csv")
    parser.add_argument("--review-log", type=str, default=None, help="Path to review_log.csv")
    parser.add_argument("--strict", action="store_true", help="Treat missing files/pack as error")

    args = parser.parse_args()
    repo_root = get_repo_root()

    pack_path = args.pack or os.path.join(repo_root, "content", "motion_pack.json")
    schema_path = args.schema or os.path.join(repo_root, "shared", "pack.schema.json")
    audio_path = args.audio_manifest or os.path.join(repo_root, "content", "tools", "audio_manifest.csv")
    review_log_path = args.review_log or os.path.join(repo_root, "content", "review_log.csv")
    transcripts_dir = os.path.join(repo_root, "content", "source", "transcripts")

    audio_ids, manifest_statuses = load_audio_manifest(audio_path)
    review_records = load_review_log(review_log_path)
    transcripts_corpus, section_map_corpus = load_transcript_texts(transcripts_dir)

    # Empty state handling
    if not os.path.exists(pack_path):
        if args.strict:
            print(f"ERROR: Pack file does not exist: {pack_path}", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"INFO: Pack file does not exist yet (empty state): {pack_path}")
            print(f"Repo root resolved to: {repo_root}")
            empty_stats = {"modalities": {}, "statuses": {}, "placeholders_count": 0}
            print_summary_table(empty_stats, manifest_statuses, 0, 0, 0)
            sys.exit(0)

    # Load JSON
    try:
        with open(pack_path, "r", encoding="utf-8") as f:
            pack_data = json.load(f)
    except Exception as e:
        print(f"ERROR: Invalid JSON in pack: {e}", file=sys.stderr)
        print("LOCAL RULES: fail      OFFICIAL SCHEMA (shared/pack.schema.json): fail")
        sys.exit(1)

    # 1. Official schema check
    schema_errors: List[str] = []
    unsupported_schema_keywords: List[str] = []
    if os.path.exists(schema_path):
        try:
            with open(schema_path, "r", encoding="utf-8") as f:
                official_schema = json.load(f)
            schema_errors, unsupported_schema_keywords = validate_json_schema(pack_data, official_schema)
        except Exception as e:
            schema_errors.append(f"Failed to read/parse schema: {e}")
    else:
        schema_errors.append(f"Official schema not found at {schema_path}")

    for unsup in unsupported_schema_keywords:
        print(f"SCHEMA NOTE: {unsup}")

    # 2. Local rules check
    local_errors, warnings, stats = validate_local_rules(
        pack_data, repo_root, audio_ids, review_records, transcripts_corpus, section_map_corpus
    )

    for w in warnings:
        print(f"WARNING: {w}")

    print_summary_table(stats, manifest_statuses, len(local_errors), len(schema_errors), len(warnings))

    # Dual verdicts
    local_verdict = "ok" if len(local_errors) == 0 else "fail"
    schema_verdict = "ok" if len(schema_errors) == 0 else "fail"

    print(f"LOCAL RULES: {local_verdict}      OFFICIAL SCHEMA (shared/pack.schema.json): {schema_verdict}")

    if schema_errors:
        for se in schema_errors:
            print(f"SCHEMA MISMATCH — needs Sibam: {se}")

    if local_errors:
        print(f"\nLOCAL RULES FAILED ({len(local_errors)} errors):", file=sys.stderr)
        for le in local_errors:
            print(f"  ERROR: {le}", file=sys.stderr)

    if local_verdict == "ok" and schema_verdict == "ok":
        print("\nVALIDATION PASSED.")
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
