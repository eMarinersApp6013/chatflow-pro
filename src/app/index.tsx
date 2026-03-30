// Root index — redirects to (tabs) if logged in, otherwise to login.

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { DarkColors } from '../constants/colors';

export default function Index() {
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (isLoggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DarkColors.bg }}>
      <ActivityIndicator color={DarkColors.green} size="large" />
    </View>
  );
}
