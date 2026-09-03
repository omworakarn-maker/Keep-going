import { ReactNode, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AccessibilityInfo, Animated, Keyboard, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export function Screen({ children, contentStyle, resetScrollOnFocus = false, backgroundColor, animateOnFocus = true, stickyHeader = false }: { children: ReactNode; contentStyle?: ViewStyle; resetScrollOnFocus?: boolean; backgroundColor?: string; animateOnFocus?: boolean; stickyHeader?: boolean }) {
  const scrollRef = useRef<ScrollView>(null);
  const entrance = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    if (resetScrollOnFocus) requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
    if (!animateOnFocus) {
      entrance.setValue(1);
      return;
    }
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
  }, [animateOnFocus, entrance, resetScrollOnFocus]));

  return (
    <SafeAreaView collapsable={false} edges={['top', 'left', 'right']} style={[styles.safe, backgroundColor ? { backgroundColor } : null]}>
      <Animated.View collapsable={false} style={[styles.animatedContent, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
        <ScrollView ref={scrollRef} style={backgroundColor ? { backgroundColor } : null} contentContainerStyle={[styles.content, contentStyle]} stickyHeaderIndices={stickyHeader ? [0] : undefined} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" onScrollBeginDrag={Keyboard.dismiss}>
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
