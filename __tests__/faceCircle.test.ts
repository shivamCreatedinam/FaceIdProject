import {
  COMPLETION_PERCENT,
  faceAngle,
  isCircleComplete,
  RING_TICKS,
  ringTicksForShots,
  tickForPose,
  TICKS_TO_COMPLETE,
} from '../src/services/faceCircle';

describe('face circle coverage', () => {
  it('ignores a face looking straight ahead', () => {
    expect(tickForPose(0, 0)).toBeNull();
    expect(tickForPose(0.05, -0.04)).toBeNull();
  });

  it('maps opposite head turns to different ticks', () => {
    const left = tickForPose(-30, 0);
    const right = tickForPose(30, 0);
    const up = tickForPose(0, 25);

    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
    expect(up).not.toBeNull();
    expect(new Set([left, right, up]).size).toBe(3);
    expect(left as number).toBeGreaterThanOrEqual(0);
    expect(right as number).toBeLessThan(RING_TICKS);
  });

  it('keeps small degree values as a straight face', () => {
    expect(tickForPose(2, -1)).toBeNull();
    expect(tickForPose(0.5, 0)).toBeNull();
  });

  it('uses the configured completion percentage', () => {
    expect(COMPLETION_PERCENT).toBe(40);
    expect(TICKS_TO_COMPLETE).toBe(
      Math.round((RING_TICKS * COMPLETION_PERCENT) / 100),
    );
  });

  it('completes once enough distinct angles are captured', () => {
    const visited = new Set<number>();
    for (let index = 0; index < TICKS_TO_COMPLETE - 1; index += 1) {
      visited.add(index);
    }
    expect(isCircleComplete(visited)).toBe(false);
    visited.add(TICKS_TO_COMPLETE);
    expect(isCircleComplete(visited)).toBe(true);
  });

  it('fills one third of the ring for each saved direction', () => {
    const left = ringTicksForShots({ left: true, center: false, right: false });
    const right = ringTicksForShots({ left: false, center: false, right: true });
    const center = ringTicksForShots({ left: false, center: true, right: false });
    const all = ringTicksForShots({ left: true, center: true, right: true });

    expect(left.size / RING_TICKS).toBeCloseTo(1 / 3, 1);
    expect(right.size / RING_TICKS).toBeCloseTo(1 / 3, 1);
    expect(center.size / RING_TICKS).toBeCloseTo(1 / 3, 1);
    expect(all.size).toBe(RING_TICKS);
    expect([...left].some(tick => right.has(tick))).toBe(false);
    expect([...left].some(tick => center.has(tick))).toBe(false);
    expect([...right].some(tick => center.has(tick))).toBe(false);
  });

  it('names center, left, and right poses from the mirrored front camera', () => {
    expect(faceAngle(0, 0)).toBe('center');
    expect(faceAngle(0.4, 0)).toBe('center');
    expect(faceAngle(-0.5, 20)).toBe('center');
    expect(faceAngle(0, 25)).toBe('center');
    expect(faceAngle(20, 0)).toBeNull();
    expect(faceAngle(35, 0)).toBe('left');
    expect(faceAngle(-35, 0)).toBe('right');
  });
});
