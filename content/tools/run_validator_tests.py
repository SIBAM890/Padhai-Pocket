#!/usr/bin/env python3
"""
run_validator_tests.py — Test runner proving validate_pack.py enforces all rules.
Tests one valid fixture and 16 invalid fixtures (one per ERROR rule).
"""

import sys
import os
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VALIDATOR = os.path.join(SCRIPT_DIR, "validate_pack.py")
TESTS_DIR = os.path.join(SCRIPT_DIR, "tests")
TEST_AUDIO_MANIFEST = os.path.join(TESTS_DIR, "test_audio_manifest.csv")
REAL_AUDIO_MANIFEST = os.path.join(SCRIPT_DIR, "audio_manifest.csv")
REAL_MOTION_PACK = os.path.join(SCRIPT_DIR, "..", "motion_pack.json")

TEST_CASES = [
    {
        "name": "valid_fixture",
        "file": "valid_fixture.json",
        "expected_exit": 0,
        "desc": "Valid pack structure conforming to schema and local rules"
    },
    {
        "name": "sealed_motion_pack",
        "file": None,
        "path": REAL_MOTION_PACK,
        "manifest": REAL_AUDIO_MANIFEST,
        "expected_exit": 0,
        "desc": "Official sealed BSE Class 9 Motion content pack"
    },
    {
        "name": "err01_invalid_json",
        "file": "err01_invalid_json.json",
        "expected_exit": 1,
        "desc": "Invalid JSON syntax"
    },
    {
        "name": "err02_missing_required_fields",
        "file": "err02_missing_required_fields.json",
        "expected_exit": 1,
        "desc": "Fails required fields of active schema"
    },
    {
        "name": "err03_duplicate_chunk_id",
        "file": "err03_duplicate_chunk_id.json",
        "expected_exit": 1,
        "desc": "Duplicate chunk_id"
    },
    {
        "name": "err04_invalid_chunk_id",
        "file": "err04_invalid_chunk_id.json",
        "expected_exit": 1,
        "desc": "Chunk ID matching neither allowed pattern"
    },
    {
        "name": "err05_status_approved",
        "file": "err05_status_approved.json",
        "expected_exit": 1,
        "desc": "Any 'approved' status (must be set by hand after native review)"
    },
    {
        "name": "err06_item_options_not_4",
        "file": "err06_item_options_not_4.json",
        "expected_exit": 1,
        "desc": "Item options count != 4"
    },
    {
        "name": "err07_correct_out_of_range",
        "file": "err07_correct_out_of_range.json",
        "expected_exit": 1,
        "desc": "Item correct index out of range 0..3"
    },
    {
        "name": "err08_a_modality_text_options",
        "file": "err08_a_modality_text_options.json",
        "expected_exit": 1,
        "desc": "A-modality item whose options are text rather than media refs"
    },
    {
        "name": "err09_audio_missing_from_manifest",
        "file": "err09_audio_missing_from_manifest.json",
        "expected_exit": 1,
        "desc": "item.audio referenced but absent from audio manifest"
    },
    {
        "name": "err10_term_missing_from_terms",
        "file": "err10_term_missing_from_terms.json",
        "expected_exit": 1,
        "desc": "term_id used in chunk but missing from terms[]"
    },
    {
        "name": "err11_empty_input_hash",
        "file": "err11_empty_input_hash.json",
        "expected_exit": 1,
        "desc": "manifest.sha256 equal to forbidden empty-input hash"
    },
    {
        "name": "err12_sha256_unbuilt",
        "file": "err12_sha256_unbuilt.json",
        "expected_exit": 1,
        "desc": "manifest.sha256 non-empty without an approved build script run"
    },
    {
        "name": "err13_reviewed_by_missing_from_log",
        "file": "err13_reviewed_by_missing_from_log.json",
        "expected_exit": 1,
        "desc": "reviewed_by non-empty without matching record in review_log.csv"
    },
    {
        "name": "err14_odia_not_in_transcripts",
        "file": "err14_odia_not_in_transcripts.json",
        "expected_exit": 1,
        "desc": "Odia text in chunk not present in active transcript files"
    },
    {
        "name": "err15_chunk_title_not_in_section_map",
        "file": "err15_chunk_title_not_in_section_map.json",
        "expected_exit": 1,
        "desc": "Chunk title not found verbatim in section_map.md"
    },
    {
        "name": "err16_invalid_modality_enum",
        "file": "err16_invalid_modality_enum.json",
        "expected_exit": 1,
        "desc": "Item modality enum value outside allowed schema enum"
    },
]


def run_all_tests():
    print("=" * 70)
    print(" RUNNING VALIDATOR v3 SELF-TESTS")
    print("=" * 70)

    passed_count = 0
    failed_count = 0

    for tc in TEST_CASES:
        fixture_path = tc.get("path") or os.path.join(TESTS_DIR, tc["file"])
        manifest_path = tc.get("manifest") or TEST_AUDIO_MANIFEST
        cmd = [
            sys.executable,
            VALIDATOR,
            "--pack", fixture_path,
            "--audio-manifest", manifest_path,
            "--strict"
        ]

        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if res.returncode == tc["expected_exit"]:
            print(f"[PASS] {tc['name']:35s} (exit {res.returncode}): {tc['desc']}")
            passed_count += 1
        else:
            print(f"[FAIL] {tc['name']:35s} (got {res.returncode}, expected {tc['expected_exit']}): {tc['desc']}")
            print("  STDOUT:", res.stdout.strip())
            print("  STDERR:", res.stderr.strip())
            failed_count += 1

    print("=" * 70)
    print(f"RESULTS: {passed_count} PASSED, {failed_count} FAILED (TOTAL {len(TEST_CASES)})")
    print("=" * 70)

    return 0 if failed_count == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
