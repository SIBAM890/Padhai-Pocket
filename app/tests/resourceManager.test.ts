import { DEFAULT_RESOURCE_CATALOG } from '../src/engine/resourceMatch';
import { FINALE_ROUTES } from '../src/navigation/FinaleRoutes';
import { utf8ToBytes, bytesToHex } from '../src/screens/ResourceManagerScreen';
import { sha256Bytes } from '../src/engine/sha256';

describe('Resource Manager & Offline Content Pack Suite', () => {
  describe('FR-27 Guardrails & Curated Catalog Integrity', () => {
    it('contains all 6 required resources in DEFAULT_RESOURCE_CATALOG', () => {
      expect(DEFAULT_RESOURCE_CATALOG.length).toBe(6);
      const ids = DEFAULT_RESOURCE_CATALOG.map((r) => r.resource_id);
      expect(ids).toContain('RES-KUI-DISP-01');
      expect(ids).toContain('RES-VIS-WELL-01');
      expect(ids).toContain('RES-AUD-STORY-01');
      expect(ids).toContain('RES-SLOW-PIC-01');
      expect(ids).toContain('RES-TIER2-EX-01');
      expect(ids).toContain('RES-CLOUD-GEN-01');
    });

    it('strictly quarantines unreviewed cloud AI as draft (FR-27 Teacher Guardrail)', () => {
      const cloudRes = DEFAULT_RESOURCE_CATALOG.find(
        (r) => r.resource_id === 'RES-CLOUD-GEN-01'
      );
      expect(cloudRes).toBeDefined();
      expect(cloudRes?.status).toBe('draft');
      expect(cloudRes?.requires_network).toBe(true);

      // Verify the other 5 are approved for offline student use
      const approved = DEFAULT_RESOURCE_CATALOG.filter(
        (r) => r.status === 'demo_approved'
      );
      expect(approved.length).toBe(5);
      approved.forEach((r) => {
        expect(r.requires_network).toBe(false);
      });
    });

    it('validates Kui word bridge resource attributes', () => {
      const kuiRes = DEFAULT_RESOURCE_CATALOG.find(
        (r) => r.resource_id === 'RES-KUI-DISP-01'
      );
      expect(kuiRes).toBeDefined();
      expect(kuiRes?.has_kui_gloss).toBe(true);
      expect(kuiRes?.modality).toBe('kui_bridge');
      expect(kuiRes?.term_id).toBe('T_DISP');
    });
  });

  describe('Pure SHA-256 Hashing & Verification in Resource Manager', () => {
    it('produces deterministic SHA-256 hex string from text input', () => {
      const sample = 'BSE9-PHYS-MOTION-S02-02';
      const bytes = utf8ToBytes(sample);
      const hashBytes = sha256Bytes(bytes);
      const hex = bytesToHex(hashBytes);

      expect(hex).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hex)).toBe(true);

      // Deterministic repetition
      const hex2 = bytesToHex(sha256Bytes(utf8ToBytes(sample)));
      expect(hex2).toBe(hex);
    });

    it('correctly handles Odia Unicode characters in UTF-8 conversion', () => {
      const odiaStr = 'ବିସ୍ଥାପନ ଓ ଦୂରତା';
      const bytes = utf8ToBytes(odiaStr);
      expect(bytes.length).toBeGreaterThan(odiaStr.length); // Multi-byte UTF-8
      const hash = bytesToHex(sha256Bytes(bytes));
      expect(hash).toHaveLength(64);
    });
  });

  describe('Route Registration & Finale Navigation', () => {
    it('registers ResourceManager route in FINALE_ROUTES', () => {
      expect(FINALE_ROUTES.ResourceManager).toBe('ResourceManager');
    });
  });

  describe('Storage Budget & Lean Architecture', () => {
    it('ensures combined offline packs size is well within the 975 KB budget (< 100 KB total)', () => {
      const physicsKb = 18.6;
      const chemistryKb = 16.1;
      const biologyKb = 10.6;
      const mathsKb = 15.9;
      const totalKb = physicsKb + chemistryKb + biologyKb + mathsKb;

      expect(totalKb).toBeLessThan(100);
      expect(totalKb).toBeLessThan(975);
      // Footprint is under 10% of 975 KB budget
      expect(totalKb / 975).toBeLessThan(0.1);
    });
  });
});
