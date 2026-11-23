import { ActivityIndicator, Button, Text, View } from 'react-native';
import { strings } from '@/ui/strings';
import { useMe, useSignOut } from './api';

export function ProfileCard() {
  const me = useMe();
  const signOut = useSignOut();

  return (
    <>
      {me.isPending ? <ActivityIndicator /> : null}
      {me.error ? <Text>{me.error.message}</Text> : null}
      {me.data ? (
        <View>
          <Text>@{me.data.username}</Text>
          <Text>{me.data.email}</Text>
        </View>
      ) : null}
      <Button title={strings.auth.signOut} onPress={() => signOut.mutate()} disabled={signOut.isPending} />
    </>
  );
}
