// Root index — redirects to (tabs) if logged in, otherwise to login.
// Uses <Redirect> instead of router.replace() in useEffect — the imperative
// router.replace() fires before the navigator finishes mounting and crashes.
// <Redirect> renders declaratively after the navigator is ready.

import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { DarkColors } from '../constants/colors';

export default function Index() {
  const { isLoggedIn, isLoading } = useAuthStore();

  // Show spinner while hydrating credentials from secure storage
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DarkColors.bg }}>
        <ActivityIndicator color={DarkColors.green} size="large" />
      </View>
    );
  }

  // Redirect declaratively — safe to call once the navigator is mounted
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
