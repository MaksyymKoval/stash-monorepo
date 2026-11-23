import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignUpForm } from '@/features/auth/SignUpForm';

export default function SignUpRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <SignUpForm onSwitch={() => router.replace('/sign-in')} />
      </ScrollView>
    </SafeAreaView>
  );
}
