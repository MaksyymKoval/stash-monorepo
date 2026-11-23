import { useState } from 'react';
import { Button, Text, TextInput } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { errorText, strings } from '@/ui/strings';

export function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(undefined);
    const { error } = await authClient.signIn.email({ email: email.trim(), password });
    setLoading(false);
    // On success useSession() updates and the root layout switches to the tabs.
    if (error) setError(errorText(error.code));
  }

  return (
    <>
      <Text>{strings.auth.signInTitle}</Text>
      <TextInput placeholder={strings.auth.email} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
      <TextInput placeholder={strings.auth.password} value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} secureTextEntry textContentType="password" />
      {error ? <Text>{error}</Text> : null}
      <Button title={strings.auth.signIn} onPress={submit} disabled={loading} />
      <Button title={strings.auth.toSignUp} onPress={onSwitch} />
    </>
  );
}
