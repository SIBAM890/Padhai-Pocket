import mathsPack from '../../content/packs/maths.json';
import { BSE_SUBJECTS } from '../src/data/bseSubjects';
import { getPackForSubject, getHeroChunk, getHeroItem, getProbeItems } from '../src/content/loader';

describe('Maths 3D Equation Solver — Linear 3x - 2y + 2 = 0 & Quadratic 3x² - 5x + 2 = 0', () => {
  describe('1. Content Pack & Chunk Validation', () => {
    test('Chunk BSE9-MATH-EQ-S01 exists with demo_approved status', () => {
      const chunk = mathsPack.chunks.find((c: any) => c.chunk_id === 'BSE9-MATH-EQ-S01');
      expect(chunk).toBeDefined();
      expect(chunk?.concept_id).toBe('linear_quadratic_equations');
      expect(chunk?.status).toBe('demo_approved');
      expect(chunk?.title_or).toContain('3x - 2y + 2 = 0');
      expect(chunk?.odia_text).toContain('-2/3');
    });

    test('All required terms exist in mathsPack', () => {
      const termIds = mathsPack.terms.map((t: any) => t.term_id);
      expect(termIds).toContain('T_ROOT_EQ');
      expect(termIds).toContain('T_INTERCEPT');
      expect(termIds).toContain('T_QUADRATIC_ROOT');

      const rootTerm = mathsPack.terms.find((t: any) => t.term_id === 'T_ROOT_EQ');
      expect(rootTerm?.kui?.description).toContain('ରେଖାଟି ଅକ୍ଷକୁ ଯେଉଁଠି କାଟେ / ଉତ୍ତର ବିନ୍ଦୁ');
      expect(rootTerm?.odia_from_textbook).toBe('ମୂଳ / ସମାଧାନ');
    });
  });

  describe('2. Diagnostic Items & P/A/T Probes for 3x - 2y + 2 = 0', () => {
    test('Hero MCQ (MATH-EQ-T1) tests X and Y axis intercepts for 3x - 2y + 2 = 0', () => {
      const item = mathsPack.items.find((i: any) => i.item_id === 'MATH-EQ-T1');
      expect(item).toBeDefined();
      expect(item?.correct).toBe(0);
      expect(item?.options[0]).toContain('X-ମୂଳ: x = -2/3');
      expect(item?.options[0]).toContain('Y-ମୂଳ: y = 1');
    });

    test('Picture Probe (MATH-EQ-P1) tests 3D coordinate graph points', () => {
      const item = mathsPack.items.find((i: any) => i.item_id === 'MATH-EQ-P1');
      expect(item).toBeDefined();
      expect(item?.modality).toBe('P');
      expect(item?.correct).toBe(0);
      expect(item?.options[0]).toContain('(-2/3, 0)');
      expect(item?.options[0]).toContain('(0, 1)');
    });

    test('Audio Probe (MATH-EQ-A1) tests spoken root when y = 0', () => {
      const item = mathsPack.items.find((i: any) => i.item_id === 'MATH-EQ-A1');
      expect(item).toBeDefined();
      expect(item?.modality).toBe('A');
      expect(item?.correct).toBe(0);
      expect(item?.options[0]).toBe('x = -2/3');
    });

    test('Term Probe (MATH-EQ-T2) bridges dialect phrase to BSE Odia terms', () => {
      const item = mathsPack.items.find((i: any) => i.item_id === 'MATH-EQ-T2');
      expect(item).toBeDefined();
      expect(item?.modality).toBe('T');
      expect(item?.correct).toBe(0);
      expect(item?.options[0]).toContain('ମୂଳ / ସମାଧାନ (Root / Solution)');
      expect(item?.options[0]).toContain('ଛେଦବିନ୍ଦୁ (Intercept)');
    });

    test('Quadratic Diagnostic MCQ (MATH-QUAD-T1) verifies discriminant and roots for 3x² - 5x + 2 = 0', () => {
      const item = mathsPack.items.find((i: any) => i.item_id === 'MATH-QUAD-T1');
      expect(item).toBeDefined();
      expect(item?.correct).toBe(0);
      expect(item?.options[0]).toContain('Δ = 1');
      expect(item?.options[0]).toContain('x = 1');
      expect(item?.options[0]).toContain('x = 2/3');
    });
  });

  describe('3. Mathematical Correctness of Solver Logic', () => {
    test('Linear Equation 3x - 2y + 2 = 0 yields exact axis roots', () => {
      const a = 3;
      const b = -2;
      const c = 2;

      // X-root (y = 0): ax + c = 0 => x = -c/a
      const xRoot = -c / a;
      expect(xRoot).toBeCloseTo(-0.6667, 3);
      expect(-c).toBe(-2);

      // Y-root (x = 0): by + c = 0 => y = -c/b
      const yRoot = -c / b;
      expect(yRoot).toBe(1.0);
    });

    test('Two intersecting planes: 3x - 2y + 2 = 0 and x + 2y - 6 = 0 intersect at (1, 2.5)', () => {
      const a1 = 3, b1 = -2, c1 = 2;
      const a2 = 1, b2 = 2, c2 = -6;

      // Determinant
      const D = a1 * b2 - a2 * b1; // 3*2 - 1*(-2) = 6 + 2 = 8
      expect(D).toBe(8);

      const Dx = (-c1) * b2 - (-c2) * b1; // (-2)*2 - (6)*(-2) = -4 + 12 = 8
      const Dy = a1 * (-c2) - a2 * (-c1); // 3*(6) - 1*(-2) = 18 - (-2) = 20
      const x = Dx / D;
      const y = Dy / D;

      expect(x).toBe(1.0);
      expect(y).toBe(2.5);

      // Verify on both lines
      expect(a1 * x + b1 * y + c1).toBe(0);
      expect(a2 * x + b2 * y + c2).toBe(0);
    });

    test('Quadratic 3x² - 5x + 2 = 0 yields discriminant 1 and roots 1 and 2/3', () => {
      const qa = 3;
      const qb = -5;
      const qc = 2;

      const delta = qb * qb - 4 * qa * qc;
      expect(delta).toBe(1);

      const root1 = (-qb + Math.sqrt(delta)) / (2 * qa);
      const root2 = (-qb - Math.sqrt(delta)) / (2 * qa);

      expect(root1).toBe(1);
      expect(root2).toBeCloseTo(0.6667, 3);

      // Verify roots satisfy equation
      expect(qa * root1 * root1 + qb * root1 + qc).toBe(0);
      expect(qa * root2 * root2 + qb * root2 + qc).toBeCloseTo(0, 5);
    });
  });

  describe('4. Curriculum & Loader Integration', () => {
    test('BSE_SUBJECTS includes linear_equation_roots topic in Mathematics', () => {
      const maths = BSE_SUBJECTS.find((s) => s.id === 'maths');
      expect(maths).toBeDefined();
      expect(maths?.totalTopics).toBe(4);
      expect(maths?.readyTopics).toBe(4);

      const allTopics = maths?.chapters.flatMap((ch) => ch.topics) || [];
      const eqTopic = allTopics.find((t) => t.id === 'linear_equation_roots');
      expect(eqTopic).toBeDefined();
      expect(eqTopic?.chunkId).toBe('BSE9-MATH-EQ-S01');
      expect(eqTopic?.ready).toBe(true);
      expect(eqTopic?.status).toBe('Full lesson ready');
    });

    test('getPackForSubject returns mathsPack for equation chunks', () => {
      const pack = getPackForSubject('maths', 'BSE9-MATH-EQ-S01');
      expect(pack).toBe(mathsPack);

      const hero = getHeroChunk('maths', 'BSE9-MATH-EQ-S01');
      expect(hero?.chunkId).toBe('BSE9-MATH-EQ-S01');
      expect(hero?.title).toContain('3x - 2y + 2 = 0');
    });

    test('getHeroItem retrieves MATH-EQ-T1 for BSE9-MATH-EQ-S01', () => {
      const item = getHeroItem('maths', 'BSE9-MATH-EQ-S01');
      expect(item?.itemId).toBe('MATH-EQ-T1');
      expect(item?.stem).toContain('3x - 2y + 2 = 0');
    });

    test('getProbeItems retrieves P, A, T probes for BSE9-MATH-EQ-S01', () => {
      const probes = getProbeItems('maths', 'BSE9-MATH-EQ-S01');
      expect(probes?.P?.item_id).toBe('MATH-EQ-P1');
      expect(probes?.A?.item_id).toBe('MATH-EQ-A1');
      expect(['MATH-EQ-T1', 'MATH-EQ-T2']).toContain(probes?.T?.item_id);
    });
  });
});
