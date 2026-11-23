import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileCard } from '@/features/auth/ProfileCard';

export default function ProfileRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <ProfileCard />
      </ScrollView>
    </SafeAreaView>
  );
}
