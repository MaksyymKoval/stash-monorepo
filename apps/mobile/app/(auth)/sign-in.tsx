import { router } from 'expo-router';
import { SignInForm } from '@/features/auth/SignInForm';
import { Screen } from '@/ui/Screen';

export default function SignInRoute() {
  return (
    <Screen>
      <SignInForm onSwitch={() => router.replace('/sign-up')} />
    </Screen>
  );
}
