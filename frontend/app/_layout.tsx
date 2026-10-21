import { Stack } from 'expo-router';
import { UserProvider } from './UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* The Login Screen */}
        <Stack.Screen name="index" />
        {/* The Main App */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </UserProvider>
  );
}