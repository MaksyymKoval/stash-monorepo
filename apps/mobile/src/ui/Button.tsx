import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme } from './theme';

type Props = { title: string; onPress: () => void; loading?: boolean; variant?: 'primary' | 'link' };

export function Button({ title, onPress, loading = false, variant = 'primary' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [primary ? styles.primary : styles.link, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={theme.color.onPrimary} />
      ) : (
        <Text style={primary ? styles.primaryText : styles.linkText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: theme.color.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.space.md,
    alignItems: 'center',
  },
  link: { paddingVertical: theme.space.sm, alignItems: 'center' },
  pressed: { opacity: 0.7 },
  primaryText: { color: theme.color.onPrimary, fontWeight: '600' },
  linkText: { color: theme.color.primary },
});
