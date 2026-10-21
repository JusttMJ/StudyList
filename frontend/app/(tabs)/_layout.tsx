import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#52525B',
        tabBarStyle: { 
          backgroundColor: '#09090B', 
          borderTopWidth: 0,
          paddingTop: 10 
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Focus', 
          tabBarIcon: ({ color }) => <Ionicons name="timer" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="two" 
        options={{ 
          title: 'Inbox', 
          tabBarIcon: ({ color }) => <Ionicons name="mail" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}