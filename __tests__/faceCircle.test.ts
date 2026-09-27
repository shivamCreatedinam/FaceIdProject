import {
  COMPLETION_PERCENT,
  isCircleComplete,
  RING_TICKS,
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

  it('accepts both radians and degrees', () => {
    expect(tickForPose(-0.6, 0.2)).toBe(tickForPose((-0.6 * 180) / Math.PI, (0.2 * 180) / Math.PI));
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
});
