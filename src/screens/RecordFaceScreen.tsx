import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera, CameraType, type CameraApi } from 'react-native-camera-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleButton } from '../components/CircleButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { TickRing } from '../components/TickRing';
import type { RecordFaceScreenProps } from '../navigation/types';
import {
  faceAngle,
  ringTicksForShots,
  type FaceAngle,
} from '../services/faceCircle';
import { colors } from '../theme/colors';

type FaceEvent = {
  nativeEvent: {
    faces: Array<{
      yaw: number;
      pitch: number;
    }>;
  };
};

type FaceShots = Record<FaceAngle, string | null>;

const EMPTY_SHOTS: FaceShots = {
  left: null,
  center: null,
  right: null,
};

const SHOT_ORDER: FaceAngle[] = ['left', 'center', 'right'];
const HOLD_FRAMES = 6;
const CAPTURE_GAP_MS = 700;

function poseName(angle: FaceAngle): string {
  if (angle === 'left') {
    return 'left';
  }
  if (angle === 'right') {
    return 'right';
  }
  return 'center';
}

export function RecordFaceScreen({ navigation }: RecordFaceScreenProps) {
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const ringSize = Math.min(width - 36, 360);
  const cameraSize = ringSize - 44;

  const [faceSeen, setFaceSeen] = useState(false);
  const [modelState, setModelState] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [shots, setShots] = useState<FaceShots>(EMPTY_SHOTS);
  const [livePose, setLivePose] = useState<FaceAngle | null>(null);
  const finished = useRef(false);
  const cameraRef = useRef<CameraApi>(null);
  const shotsRef = useRef<FaceShots>(EMPTY_SHOTS);
  const captureBusy = useRef(false);
  const nextCaptureAt = useRef(0);
  const streak = useRef<{ angle: FaceAngle | null; count: number }>({
    angle: null,
    count: 0,
  });

  const finish = useCallback(() => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    setOptionsOpen(false);
    setSucceeded(true);
  }, []);

  const captureAngle = useCallback((angle: FaceAngle) => {
    if (shotsRef.current[angle] || captureBusy.current || !cameraRef.current) {
      return;
    }
    captureBusy.current = true;
    setCapturing(true);
    streak.current = { angle: null, count: 0 };
    cameraRef.current
      .capture()
      .then(photo => {
        const uri = photo?.uri;
        if (!uri || shotsRef.current[angle]) {
          return;
        }
        const next = { ...shotsRef.current, [angle]: uri };
        shotsRef.current = next;
        setShots(next);
      })
      .catch(() => undefined)
      .finally(() => {
        captureBusy.current = false;
        nextCaptureAt.current = Date.now() + CAPTURE_GAP_MS;
        streak.current = { angle: null, count: 0 };
        setCapturing(false);
      });
  }, []);

  const onFaceDetected = useCallback(
    (event: FaceEvent) => {
      if (succeeded) {
        return;
      }
      const face = event.nativeEvent.faces[0];
      if (!face) {
        return;
      }
      setFaceSeen(true);
      const angle = faceAngle(face.yaw, face.pitch);
      setLivePose(current => (current === angle ? current : angle));

      if (!captureBusy.current) {
        if (angle && angle === streak.current.angle) {
          streak.current.count += 1;
        } else {
          streak.current = { angle, count: angle ? 1 : 0 };
        }

        if (
          angle &&
          !shotsRef.current[angle] &&
          streak.current.count >= HOLD_FRAMES &&
          Date.now() >= nextCaptureAt.current
        ) {
          captureAngle(angle);
        }
      }
    },
    [captureAngle, succeeded],
  );

  const shotsReady =
    Boolean(shots.left) && Boolean(shots.center) && Boolean(shots.right);

  useEffect(() => {
    if (shotsReady) {
      finish();
    }
  }, [finish, shotsReady]);

  const instruction = succeeded
    ? 'Face ID is ready'
    : 'Hold one pose at a time.';

  const detail = succeeded
    ? 'Left, center, and right are saved.'
    : !faceSeen
      ? 'Position your face in the camera frame.'
      : livePose && !shots[livePose]
        ? `Hold ${poseName(livePose)} to save only that photo.`
        : 'Turn your head clearly left, center, or right.';

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <CircleButton
            icon="close"
            accessibilityLabel="Close"
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={styles.content}>
          <View style={[styles.stage, { width: ringSize, height: ringSize }]}>
            <TickRing
              size={ringSize}
              activeTicks={
                succeeded || shotsReady
                  ? undefined
                  : ringTicksForShots({
                      left: Boolean(shots.left),
                      center: Boolean(shots.center),
                      right: Boolean(shots.right),
                    })
              }
              dimOpacity={0.28}
              activeColor={colors.success}
            />
            <View
              style={[
                styles.cameraClip,
                {
                  width: cameraSize,
                  height: cameraSize,
                  borderRadius: cameraSize / 2,
                },
              ]}>
              {isFocused && (!succeeded || capturing) ? (
                <Suspense fallback={<View style={styles.cameraFallback} />}>
                  <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    cameraType={CameraType.Front}
                    resizeMode="cover"
                    iOsDeferredStart={false}
                    faceDetectionEnabled
                    faceDetectionThrottleMs={80}
                    flashMode="off"
                    shutterPhotoSound={false}
                    maxPhotoQualityPrioritization="speed"
                    onFaceDetected={onFaceDetected}
                    onFaceDetectionInstallStatus={event => {
                      setModelState(event.nativeEvent.state);
                    }}
                  />
                </Suspense>
              ) : (
                <View style={styles.cameraFallback} />
              )}
              <View style={styles.crosshairHorizontal} pointerEvents="none" />
              <View style={styles.crosshairVertical} pointerEvents="none" />
            </View>
          </View>
          <View style={styles.shots}>
            {SHOT_ORDER.map(angle => (
              <View key={angle} style={styles.shot}>
                {shots[angle] ? (
                  <Image
                    source={{ uri: shots[angle] }}
                    style={[
                      styles.shotImage,
                      livePose === angle && styles.shotActive,
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.shotEmpty,
                      livePose === angle && styles.shotActive,
                    ]}
                  />
                )}
                <Text style={styles.shotLabel}>
                  {angle === 'left' ? 'Left' : angle === 'center' ? 'Center' : 'Right'}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.instruction}>{instruction}</Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
          {modelState === 'downloading' || modelState === 'installing' ? (
            <Text style={styles.detail}>Preparing face detection…</Text>
          ) : null}
        </View>
        {succeeded ? (
          <PrimaryButton label="Done" onPress={() => navigation.popToTop()} />
        ) : (
          <PrimaryButton
            label="Accessibility Options"
            variant="secondary"
            onPress={() => setOptionsOpen(true)}
          />
        )}
      </SafeAreaView>
      <Modal
        visible={optionsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setOptionsOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOptionsOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>Accessibility Options</Text>
            <Text style={styles.sheetBody}>
              If moving your head is difficult, you can finish setup without
              completing the circle.
            </Text>
            <PrimaryButton label="Finish setup" onPress={finish} />
            <View style={styles.sheetGap} />
            <PrimaryButton
              label="Cancel"
              variant="secondary"
              onPress={() => setOptionsOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  topBar: {
    height: 52,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraClip: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#141414',
  },
  crosshairHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.crosshair,
  },
  crosshairVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.crosshair,
  },
  shots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 28,
  },
  shot: {
    alignItems: 'center',
    width: 64,
  },
  shotImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  shotEmpty: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  shotActive: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  shotLabel: {
    color: colors.body,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  instruction: {
    color: colors.title,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 16,
  },
  detail: {
    color: colors.body,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  sheetTitle: {
    color: colors.title,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  sheetBody: {
    color: colors.body,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 22,
  },
  sheetGap: {
    height: 10,
  },
});
