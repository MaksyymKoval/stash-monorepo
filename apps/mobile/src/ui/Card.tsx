import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from './theme';

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: theme.space.md, gap: theme.space.sm },
});
