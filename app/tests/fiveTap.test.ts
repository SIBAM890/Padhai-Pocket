import { _tickFiveTap } from '../src/hooks/useFiveTapGesture';

describe('useFiveTapGesture — _tickFiveTap pure helper', () => {
  it('initializes count to 1 on the first tap', () => {
    const initialState = { count: 0, lastTapMs: 0 };
    const { nextState, triggered } = _tickFiveTap(initialState, 1000, 3000, 5);

    expect(triggered).toBe(false);
    expect(nextState).toEqual({ count: 1, lastTapMs: 1000 });
  });

  it('increments count on subsequent taps within window', () => {
    let state = { count: 1, lastTapMs: 1000 };
    const res1 = _tickFiveTap(state, 1500, 3000, 5);
    expect(res1.triggered).toBe(false);
    expect(res1.nextState).toEqual({ count: 2, lastTapMs: 1500 });

    state = res1.nextState;
    const res2 = _tickFiveTap(state, 2000, 3000, 5);
    expect(res2.triggered).toBe(false);
    expect(res2.nextState).toEqual({ count: 3, lastTapMs: 2000 });

    state = res2.nextState;
    const res3 = _tickFiveTap(state, 2500, 3000, 5);
    expect(res3.triggered).toBe(false);
    expect(res3.nextState).toEqual({ count: 4, lastTapMs: 2500 });
  });

  it('triggers on the 5th tap and resets state', () => {
    const state = { count: 4, lastTapMs: 2500 };
    const { nextState, triggered } = _tickFiveTap(state, 3000, 3000, 5);

    expect(triggered).toBe(true);
    expect(nextState).toEqual({ count: 0, lastTapMs: 0 });
  });

  it('resets count to 1 if time between taps exceeds windowMs', () => {
    const state = { count: 3, lastTapMs: 1000 };
    // 1000 + 3500 = 4500 ms (elapsed 3500 > 3000)
    const { nextState, triggered } = _tickFiveTap(state, 4500, 3000, 5);

    expect(triggered).toBe(false);
    expect(nextState).toEqual({ count: 1, lastTapMs: 4500 });
  });

  it('respects custom requiredTaps and windowMs options', () => {
    const state = { count: 2, lastTapMs: 500 };
    // Custom: 3 taps needed
    const { nextState, triggered } = _tickFiveTap(state, 800, 1000, 3);

    expect(triggered).toBe(true);
    expect(nextState).toEqual({ count: 0, lastTapMs: 0 });
  });
});
