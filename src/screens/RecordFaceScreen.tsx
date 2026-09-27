import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleButton } from '../components/CircleButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { TickRing } from '../components/TickRing';
import type { RecordFaceScreenProps } from '../navigation/types';
import {
  isCircleComplete,
  tickForPose,
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

export function RecordFaceScreen({ navigation }: RecordFaceScreenProps) {
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const ringSize = Math.min(width - 36, 360);
  const cameraSize = ringSize - 44;

  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set());
  const [faceSeen, setFaceSeen] = useState(false);
  const [modelState, setModelState] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    setOptionsOpen(false);
    setSucceeded(true);
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
      const tick = tickForPose(face.yaw, face.pitch);
      if (tick == null) {
        return;
      }
      setVisited(current => {
        if (current.has(tick) || isCircleComplete(current)) {
          return current;
        }
        const next = new Set(current);
        next.add(tick);
        return next;
      });
    },
    [succeeded],
  );

  useEffect(() => {
    if (isCircleComplete(visited)) {
      finish();
    }
  }, [finish, visited]);

  const instruction = succeeded
    ? 'Face ID is ready'
    : 'Move your head slowly to complete the circle.';

  const detail = succeeded
    ? 'You showed the angles of your face.'
    : !faceSeen
      ? 'Position your face in the camera frame.'
      : null;

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
              activeTicks={succeeded ? undefined : visited}
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
              {isFocused && !succeeded ? (
                <Suspense fallback={<View style={styles.cameraFallback} />}>
                  <Camera
                    style={StyleSheet.absoluteFill}
                    cameraType={CameraType.Front}
                    resizeMode="cover"
                    iOsDeferredStart={false}
                    faceDetectionEnabled
                    faceDetectionThrottleMs={80}
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
  instruction: {
    color: colors.title,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 36,
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
