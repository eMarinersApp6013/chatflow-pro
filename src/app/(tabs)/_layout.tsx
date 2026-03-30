// Tab bar layout — 4 tabs: Chats, Dashboard, Catalog, Settings.
// Chats tab shows a red unread count badge driven by WatermelonDB.

import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MessageCircle, BarChart2, ShoppingBag, Settings } from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';
import { useUIStore } from '../../store/uiStore';
import { conversationsCollection } from '../../db/database';

function UnreadBubble({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={tabStyles.badge}>
      <Text style={tabStyles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ea4335',
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});

export default function TabLayout() {
  const { colors } = useUIStore();
  const [totalUnread, setTotalUnread] = useState(0);

  // Live unread count from WatermelonDB — updates whenever any conversation changes
  useEffect(() => {
    const subscription = conversationsCollection
      .query(Q.where('status', 'open'))
      .observe()
      .subscribe((records) => {
        const total = records.reduce((sum, r) => sum + (r.unreadCount ?? 0), 0);
        setTotalUnread(total);
      });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MessageCircle color={color} size={size} />
              <UnreadBubble count={totalUnread} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <BarChart2 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
