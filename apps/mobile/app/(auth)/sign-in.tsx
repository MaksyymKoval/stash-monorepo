import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignInForm } from '@/features/auth/SignInForm';

export default function SignInRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <SignInForm onSwitch={() => router.replace('/sign-up')} />
      </ScrollView>
    </SafeAreaView>
  );
}
