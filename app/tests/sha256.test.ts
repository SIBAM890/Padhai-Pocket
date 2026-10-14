import { sha256Bytes } from '../src/engine/sha256';
import { computeSeed } from '../src/engine/seed';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('Pure-JS SHA-256 and Deterministic Seed', () => {
  test('T1 — sha256Bytes empty string matches standard SHA-256 hash', () => {
    const emptyBytes = new Uint8Array(0);
    const hash = sha256Bytes(emptyBytes);
    expect(bytesToHex(hash)).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });

  test('T2 — sha256Bytes "abc" matches standard SHA-256 hash', () => {
    const input = new TextEncoder().encode('abc');
    const hash = sha256Bytes(input);
    expect(bytesToHex(hash)).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  test('T3 — computeSeed Set A matches golden demo seed', async () => {
    const seed = await computeSeed('prof_demo_01', 'distance_vs_displacement', 'A');
    expect(seed).toBe(1806635391);
  });

  test('T4 — computeSeed Set B matches golden seed', async () => {
    const seed = await computeSeed('prof_demo_01', 'distance_vs_displacement', 'B');
    expect(seed).toBe(3861694576);
  });

  test('T5 — computeSeed Set C matches golden seed', async () => {
    const seed = await computeSeed('prof_demo_01', 'distance_vs_displacement', 'C');
    expect(seed).toBe(3787510126);
  });
});
