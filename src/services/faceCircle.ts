export const RING_TICKS = 56;
/** Change this to require more or less of the head circle. */
export const COMPLETION_PERCENT = 40;
export const TICKS_TO_COMPLETE = Math.round(
  (RING_TICKS * COMPLETION_PERCENT) / 100,
);

function toDegrees(value: number): number {
  if (Math.abs(value) <= Math.PI + 0.001) {
    return (value * 180) / Math.PI;
  }
  return value;
}

/**
 * Maps a detected face pose onto one tick of the setup ring.
 * A face looking straight at the camera returns null so the center pose
 * does not fill the circle by itself.
 */
export function tickForPose(yaw: number, pitch: number): number | null {
  const yawDegrees = toDegrees(yaw);
  const pitchDegrees = toDegrees(pitch);
  const magnitude = Math.hypot(yawDegrees, pitchDegrees);

  if (magnitude < 12) {
    return null;
  }

  const angle = Math.atan2(pitchDegrees, yawDegrees);
  const index = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * RING_TICKS);
  return ((index % RING_TICKS) + RING_TICKS) % RING_TICKS;
}

export function circleProgress(visited: ReadonlySet<number>): number {
  return Math.min(visited.size / TICKS_TO_COMPLETE, 1);
}

export function isCircleComplete(visited: ReadonlySet<number>): boolean {
  return visited.size >= TICKS_TO_COMPLETE;
}
