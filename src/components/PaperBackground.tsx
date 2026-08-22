import { StyleSheet, View } from 'react-native';

export function PaperBackground({ lines = 15, top = 0 }: { lines?: number; top?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.lines, { top }]}>
        {Array.from({ length: lines }, (_, index) => <View key={index} style={styles.line} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lines: { position: 'absolute', left: 0, right: 0 },
  line: { height: 28, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D9DED7' },
});
