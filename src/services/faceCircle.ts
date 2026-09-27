export const RING_TICKS = 56;
/** Change this to require more or less of the head circle. */
export const COMPLETION_PERCENT = 40;
export const TICKS_TO_COMPLETE = Math.round(
  (RING_TICKS * COMPLETION_PERCENT) / 100,
);

/**
 * Camera Kit already reports yaw and pitch in degrees on both platforms.
 * Values near zero must stay small. Treating them as radians turns a face
 * looking straight ahead into a large left or right turn.
 */
function toDegrees(value: number): number {
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

const CENTER_TICKS = Math.round(RING_TICKS / 3);
const RIGHT_TICKS = Math.round(RING_TICKS / 3);
const LEFT_TICKS = RING_TICKS - CENTER_TICKS - RIGHT_TICKS;
const CENTER_START = RING_TICKS - Math.floor(CENTER_TICKS / 2);
const RIGHT_START = (CENTER_START + CENTER_TICKS) % RING_TICKS;
const LEFT_START = (RIGHT_START + RIGHT_TICKS) % RING_TICKS;

function addArc(ticks: Set<number>, start: number, count: number) {
  for (let offset = 0; offset < count; offset += 1) {
    ticks.add((start + offset) % RING_TICKS);
  }
}

/** Each saved direction lights one third of the ring. All three fill it. */
export function ringTicksForShots(captured: {
  left: boolean;
  center: boolean;
  right: boolean;
}): Set<number> {
  const ticks = new Set<number>();
  if (captured.center) {
    addArc(ticks, CENTER_START, CENTER_TICKS);
  }
  if (captured.right) {
    addArc(ticks, RIGHT_START, RIGHT_TICKS);
  }
  if (captured.left) {
    addArc(ticks, LEFT_START, LEFT_TICKS);
  }
  return ticks;
}

export type FaceBounds = {
  boundsX: number;
  boundsY: number;
  boundsWidth: number;
  boundsHeight: number;
};

/**
 * The camera is clipped to a circle. A partial head still produces a face box,
 * so capture only when that whole box sits inside the circle. A half face or a
 * head cut by the edge has a corner outside this radius.
 */
const FULL_FACE_RADIUS = 0.42;
const MIN_FACE_WIDTH = 0.24;
const MIN_FACE_HEIGHT = 0.3;

export function isFaceFullyVisible(face: FaceBounds): boolean {
  const { boundsX, boundsY, boundsWidth, boundsHeight } = face;
  if (boundsWidth < MIN_FACE_WIDTH || boundsHeight < MIN_FACE_HEIGHT) {
    return false;
  }

  const limit = FULL_FACE_RADIUS * FULL_FACE_RADIUS;
  const corners = [
    [boundsX, boundsY],
    [boundsX + boundsWidth, boundsY],
    [boundsX, boundsY + boundsHeight],
    [boundsX + boundsWidth, boundsY + boundsHeight],
  ];

  return corners.every(([x, y]) => {
    const dx = x - 0.5;
    const dy = y - 0.5;
    return dx * dx + dy * dy <= limit;
  });
}

export type FaceAngle = 'left' | 'center' | 'right';

const CENTER_YAW = 12;
const SIDE_YAW = 28;

/**
 * Left and right follow the mirrored front-camera preview, so the user's own
 * left turn is the Left photo. A nod does not change the slot.
 * Anything between a straight face and a clear turn is ignored, so one pose
 * cannot fill the other two photos.
 * ML Kit yaw is measured on the unmirrored frame, so it is flipped.
 */
export function faceAngle(yaw: number, _pitch: number): FaceAngle | null {
  const yawDegrees = -toDegrees(yaw);
  const absYaw = Math.abs(yawDegrees);

  if (absYaw < CENTER_YAW) {
    return 'center';
  }
  if (absYaw < SIDE_YAW) {
    return null;
  }
  return yawDegrees < 0 ? 'left' : 'right';
}
