import { useState } from 'react';
import { Button, Text, TextInput } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { errorText, strings } from '@/ui/strings';

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
      <Text>{strings.auth.signUpTitle}</Text>
      <TextInput placeholder={strings.auth.username} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} textContentType="username" />
      <Text>{strings.auth.usernameHint}</Text>
      <TextInput placeholder={strings.auth.email} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
      <TextInput placeholder={strings.auth.password} value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} secureTextEntry textContentType="newPassword" />
      {error ? <Text>{error}</Text> : null}
      <Button title={strings.auth.signUp} onPress={submit} disabled={loading} />
      <Button title={strings.auth.toSignIn} onPress={onSwitch} />
    </>
  );
}
