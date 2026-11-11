import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Text';
import { theme } from './theme';

export function Input({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={styles.field}>
      <Text variant="muted">{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={theme.color.muted}
        style={styles.input}
        {...props}
      />
      {hint ? <Text variant="muted">{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: theme.space.xs },
  input: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.sm,
    padding: theme.space.md,
    fontSize: theme.font.body,
    color: theme.color.text,
  },
});
