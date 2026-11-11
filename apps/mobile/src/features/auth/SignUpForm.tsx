import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { errorText, strings } from '@/ui/strings';
import { Text } from '@/ui/Text';

export function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(undefined);
    const name = username.trim().toLowerCase();
    // `username` is not a Better Auth field: the API reads it from the sign-up body and
    // creates the profile row. Built as a variable because the client's type only knows
    // Better Auth's own fields. `name` is required by Better Auth and gets the username
    // until profiles have a display name.
    const body = { email: email.trim(), password, name, username: name };
    const { error } = await authClient.signUp.email(body);
    setLoading(false);
    if (error) setError(errorText(error.code));
  }

  return (
    <>
      <Text variant="title">{strings.auth.signUpTitle}</Text>
      <Input label={strings.auth.username} hint={strings.auth.usernameHint} value={username} onChangeText={setUsername} textContentType="username" />
      <Input label={strings.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" />
      <Input label={strings.auth.password} value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button title={strings.auth.signUp} onPress={submit} loading={loading} />
      <Button title={strings.auth.toSignIn} onPress={onSwitch} variant="link" />
    </>
  );
}
