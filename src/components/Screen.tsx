import { ReactNode, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AccessibilityInfo, Animated, SafeAreaView, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

export function Screen({ children, contentStyle, resetScrollOnFocus = false, backgroundColor }: { children: ReactNode; contentStyle?: ViewStyle; resetScrollOnFocus?: boolean; backgroundColor?: string }) {
  const scrollRef = useRef<ScrollView>(null);
  const entrance = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    if (resetScrollOnFocus) requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active) return;
      entrance.stopAnimation();
      if (reduceMotion) return entrance.setValue(1);
      entrance.setValue(0);
      Animated.timing(entrance, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    });
    return () => {
      active = false;
      entrance.stopAnimation();
    };
  }, [entrance, resetScrollOnFocus]));

  return (
    <SafeAreaView style={[styles.safe, backgroundColor ? { backgroundColor } : null]}>
      <Animated.View style={[styles.animatedContent, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
        <ScrollView ref={scrollRef} style={backgroundColor ? { backgroundColor } : null} contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  animatedContent: { flex: 1 },
  content: { flexGrow: 1, padding: 24, paddingBottom: 44 },
});
