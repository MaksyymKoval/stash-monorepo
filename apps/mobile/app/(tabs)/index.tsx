import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { strings } from '@/ui/strings';

export default function FeedRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>{strings.empty}</Text>
    </SafeAreaView>
  );
}
