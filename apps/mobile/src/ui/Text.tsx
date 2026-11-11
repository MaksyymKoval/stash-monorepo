import { Text as RNText, StyleSheet, type TextProps } from 'react-native';
import { theme } from './theme';

type Variant = 'body' | 'title' | 'muted' | 'error';

export function Text({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  return <RNText style={[styles.base, styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  base: { color: theme.color.text, fontSize: theme.font.body },
  body: {},
  title: { fontSize: theme.font.title, fontWeight: '700' },
  muted: { color: theme.color.muted, fontSize: theme.font.small },
  error: { color: theme.color.danger, fontSize: theme.font.small },
});
