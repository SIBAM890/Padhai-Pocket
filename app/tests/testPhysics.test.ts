import { BSE_SUBJECTS } from '../src/data/bseSubjects';
import {
  getPackForSubject,
  getHeroChunk,
  getHeroItem,
  getProbeItems,
  getConfirmItem,
} from '../src/content/loader';
import { getPositionAtT } from '../src/components/MotionSimulation';
import { computeSeed, probeOrder } from '../src/engine/seed';

describe('Physics Module Verification & Crash Protection', () => {
  it('BSE_SUBJECTS contains physics with all 4 Class 9 curriculum topics', () => {
    const physics = BSE_SUBJECTS.find((s) => s.id === 'physics');
    expect(physics).toBeDefined();
    expect(physics?.readyTopics).toBe(4);
    expect(physics?.totalTopics).toBe(4);

    const topicIds = physics?.chapters.flatMap((ch) => ch.topics.map((t) => t.id));
    expect(topicIds).toContain('distance_vs_displacement');
    expect(topicIds).toContain('velocity_and_acceleration');
    expect(topicIds).toContain('mass_and_weight');
    expect(topicIds).toContain('universal_law_gravitation');
  });

  it('correctly loads physics motion pack for motion topics', () => {
    const pack = getPackForSubject('physics', 'BSE9-PHYS-MOTION-S02-02');
    expect(pack).toBeDefined();
    expect(pack.chunks).toBeDefined();
    expect(pack.chunks.length).toBeGreaterThan(0);

    const heroChunk = getHeroChunk('physics', 'BSE9-PHYS-MOTION-S02-02');
    expect(heroChunk).toBeDefined();
    expect(heroChunk?.title).toContain('ବିସ୍ଥାପନ');

    const heroItem = getHeroItem('physics', 'BSE9-PHYS-MOTION-S02-02');
    expect(heroItem).toBeDefined();
    expect(heroItem?.options.length).toBeGreaterThanOrEqual(4);
  });

  it('correctly loads gravitation pack for gravitation topics', () => {
    const pack = getPackForSubject('physics', 'BSE9-PHYS-GRAV-S03-01');
    expect(pack).toBeDefined();

    const heroChunk = getHeroChunk('physics', 'BSE9-PHYS-GRAV-S03-01');
    expect(heroChunk).toBeDefined();
    expect(heroChunk?.title).toContain('ବସ୍ତୁତ୍ୱ');

    const heroItem = getHeroItem('physics', 'BSE9-PHYS-GRAV-S03-01');
    expect(heroItem).toBeDefined();
    expect(heroItem?.options.length).toBeGreaterThanOrEqual(4);
  });

  it('provides all 3 probe modalities (P, A, T) for physics', () => {
    const probes = getProbeItems('physics', 'BSE9-PHYS-MOTION-S02-02');
    expect(probes).toBeDefined();
    expect(probes?.P).toBeDefined();
    expect(probes?.A).toBeDefined();
    expect(probes?.T).toBeDefined();
    expect(probes?.P.stem).toBeDefined();
    expect(probes?.A.stem).toBeDefined();
    expect(probes?.T.stem).toBeDefined();
  });

  it('computes deterministic seed and probe order for physics concepts', async () => {
    const motionSeed = await computeSeed('prof_demo_01', 'distance_vs_displacement', 'A');
    expect(motionSeed).toBe(1806635391);
    const motionOrder = probeOrder(motionSeed);
    expect(motionOrder).toEqual(['T', 'A', 'P']);

    const gravSeed = await computeSeed('prof_demo_01', 'mass_vs_weight', 'A');
    expect(typeof gravSeed).toBe('number');
    expect(gravSeed).toBeGreaterThan(0);
    const gravOrder = probeOrder(gravSeed);
    expect(gravOrder.length).toBe(3);
  });

  it('computes 2D cubic bezier coordinates accurately for Motion Simulation', () => {
    const start = getPositionAtT(0);
    expect(start.x).toBeCloseTo(40, 0);
    expect(start.y).toBeCloseTo(140, 0);

    const mid = getPositionAtT(0.5);
    expect(mid.x).toBeCloseTo(170, 0);
    expect(mid.y).toBeCloseTo(130, 0);

    const end = getPositionAtT(1);
    expect(end.x).toBeCloseTo(300, 0);
    expect(end.y).toBeCloseTo(60, 0);
  });
});
