import { Screen } from '@/ui/Screen';
import { strings } from '@/ui/strings';
import { Text } from '@/ui/Text';

export default function StashRoute() {
  return (
    <Screen>
      <Text variant="muted">{strings.empty}</Text>
    </Screen>
  );
}
