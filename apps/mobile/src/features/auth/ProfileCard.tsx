import { ActivityIndicator } from 'react-native';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { strings } from '@/ui/strings';
import { Text } from '@/ui/Text';
import { theme } from '@/ui/theme';
import { useMe, useSignOut } from './api';

export function ProfileCard() {
  const me = useMe();
  const signOut = useSignOut();

  return (
    <>
      {me.isPending ? <ActivityIndicator color={theme.color.primary} /> : null}
      {me.error ? <Text variant="error">{me.error.message}</Text> : null}
      {me.data ? (
        <Card>
          <Text variant="title">@{me.data.username}</Text>
          <Text variant="muted">{me.data.email}</Text>
        </Card>
      ) : null}
      <Button title={strings.auth.signOut} onPress={() => signOut.mutate()} loading={signOut.isPending} variant="link" />
    </>
  );
}
