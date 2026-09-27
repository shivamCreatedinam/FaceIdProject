import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RESULTS } from 'react-native-permissions';
import { FaceGlyph } from '../components/FaceGlyph';
import { PrimaryButton } from '../components/PrimaryButton';
import { TickRing } from '../components/TickRing';
import type { PermissionScreenProps } from '../navigation/types';
import {
  ensureCameraPermission,
  getCameraPermission,
  isCameraGranted,
} from '../services/permissions';
import { colors } from '../theme/colors';

export function PermissionScreen({ navigation }: PermissionScreenProps) {
  const [cameraGranted, setCameraGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const cameraStatus = await getCameraPermission();
    setCameraGranted(isCameraGranted(cameraStatus));
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setError('Could not check camera access.');
    });
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh().catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  const onContinue = async () => {
    setBusy(true);
    setError(null);
    try {
      const cameraStatus = await ensureCameraPermission();
      const granted = isCameraGranted(cameraStatus);
      setCameraGranted(granted);
      if (!granted) {
        setError(
          cameraStatus === RESULTS.BLOCKED
            ? 'Camera access is blocked. Enable it in Settings, then return here.'
            : 'Camera access is required to frame your face.',
        );
        return;
      }

      navigation.navigate('HowToSetup');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Permission request failed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <TickRing size={250} />
            <View style={styles.glyph}>
              <FaceGlyph size={108} />
            </View>
          </View>
          <Text style={styles.title}>Permissions</Text>
          <Text style={styles.body}>
            Allow the camera so Face ID can see your face in the frame.
          </Text>
          <View style={styles.cards}>
            <PermissionRow
              title="Camera"
              detail="Position your face in the frame."
              status={cameraGranted ? 'Allowed' : 'Required'}
              ready={cameraGranted}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <PrimaryButton
          label="Continue"
          onPress={onContinue}
          loading={busy}
        />
      </SafeAreaView>
    </View>
  );
}

function PermissionRow({
  title,
  detail,
  status,
  ready,
}: {
  title: string;
  detail: string;
  status: string;
  ready: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDetail}>{detail}</Text>
      </View>
      <Text style={[styles.cardStatus, ready && styles.cardStatusReady]}>
        {status}
      </Text>
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
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    alignSelf: 'center',
    marginBottom: 28,
  },
  glyph: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.title,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: colors.body,
    fontSize: 17,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  cards: {
    marginTop: 28,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.title,
    fontSize: 17,
    fontWeight: '600',
  },
  cardDetail: {
    color: colors.body,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  cardStatus: {
    color: colors.body,
    fontSize: 13,
    fontWeight: '600',
  },
  cardStatusReady: {
    color: colors.success,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 16,
  },
});
