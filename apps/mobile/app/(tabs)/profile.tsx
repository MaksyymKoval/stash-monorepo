import { Screen } from '@/ui/Screen';
import { strings } from '@/ui/strings';
import { Text } from '@/ui/Text';

export default function ProfileRoute() {
  return (
    <Screen>
      <Text variant="muted">{strings.empty}</Text>
    </Screen>
  );
}
