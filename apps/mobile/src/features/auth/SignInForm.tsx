import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { errorText, strings } from '@/ui/strings';
import { Text } from '@/ui/Text';

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
      <Text variant="title">{strings.auth.signInTitle}</Text>
      <Input label={strings.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" />
      <Input label={strings.auth.password} value={password} onChangeText={setPassword} secureTextEntry textContentType="password" />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button title={strings.auth.signIn} onPress={submit} loading={loading} />
      <Button title={strings.auth.toSignUp} onPress={onSwitch} variant="link" />
    </>
  );
}
