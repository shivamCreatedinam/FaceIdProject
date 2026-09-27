import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleButton } from '../components/CircleButton';
import { FaceGlyph } from '../components/FaceGlyph';
import { PrimaryButton } from '../components/PrimaryButton';
import { TickRing } from '../components/TickRing';
import type { HowToSetupScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

export function HowToSetupScreen({ navigation }: HowToSetupScreenProps) {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <CircleButton
            icon="back"
            accessibilityLabel="Back"
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.hero}>
            <TickRing size={268} />
            <View style={styles.glyph}>
              <FaceGlyph size={118} />
            </View>
          </View>
          <Text style={styles.title}>How to Set Up Face ID</Text>
          <Text style={styles.body}>
            First, position your face in the camera frame. Then move your head
            in a circle to show all the angles of your face.
          </Text>
        </View>
        <PrimaryButton
          label="Get Started"
          onPress={() => navigation.navigate('RecordFace')}
        />
      </SafeAreaView>
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
    paddingBottom: 18,
  },
  topBar: {
    height: 52,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  hero: {
    alignSelf: 'center',
    marginBottom: 36,
  },
  glyph: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.title,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: colors.body,
    fontSize: 17,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
  },
});
