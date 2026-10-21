import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext';

const LAPTOP_IP = '172.27.110.15'; // <-- Make sure this matches your laptop's IP address on the local network! 

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const { setUser } = useUser();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username) return Alert.alert("Hold up", "Please enter your username.");

    try {
      const response = await fetch(`http://${LAPTOP_IP}:5282/api/StudyList/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data); // Save the dynamic UserId to the global brain!
        router.replace('/(tabs)'); // Teleport them into the app
      } else {
        Alert.alert("Access Denied", "Username not found in the system.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Changed Icon to a Book and Color to Sky Blue */}
        <Ionicons name="book-outline" size={80} color="#38BDF8" />
        <Text style={styles.brandTitle}>STUDYLIST</Text>
        <Text style={styles.brandSubtitle}>ENTER THE ZONE</Text>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#A3A3A3" style={styles.icon} />
        <TextInput 
          style={styles.input}
          placeholder="Enter Username (e.g., TestStudent)"
          placeholderTextColor="#737373"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>INITIALIZE</Text>
        <Ionicons name="arrow-forward" size={20} color="#09090B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', justifyContent: 'center', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  brandTitle: { color: '#FAFAFA', fontSize: 32, fontWeight: '900', letterSpacing: 4, marginTop: 10 },
  // Changed Subtitle color to Sky Blue
  brandSubtitle: { color: '#38BDF8', fontSize: 12, fontWeight: '700', letterSpacing: 3, marginTop: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: '#27272A' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#FAFAFA', paddingVertical: 18, fontSize: 16, fontWeight: '500' },
  loginBtn: { flexDirection: 'row', backgroundColor: '#FAFAFA', paddingVertical: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#FAFAFA', shadowOpacity: 0.2, shadowRadius: 10 },
  loginBtnText: { color: '#09090B', fontSize: 16, fontWeight: '900', letterSpacing: 2 }
});