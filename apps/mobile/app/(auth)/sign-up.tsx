import { router } from 'expo-router';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { Screen } from '@/ui/Screen';

export default function SignUpRoute() {
  return (
    <Screen>
      <SignUpForm onSwitch={() => router.replace('/sign-in')} />
    </Screen>
  );
}
