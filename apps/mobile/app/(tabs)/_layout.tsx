import { Tabs } from 'expo-router';
import { strings } from '@/ui/strings';
import { theme } from '@/ui/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.color.primary }}>
      <Tabs.Screen name="index" options={{ title: strings.tabs.feed }} />
      <Tabs.Screen name="stash" options={{ title: strings.tabs.stash }} />
      <Tabs.Screen name="profile" options={{ title: strings.tabs.profile }} />
    </Tabs>
  );
}
