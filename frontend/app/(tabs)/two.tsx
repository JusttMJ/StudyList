import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, FlatList, RefreshControl, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../UserContext'; // <-- The Brain!

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LAPTOP_IP = '172.27.110.15';

export default function InboxScreen() {
  const { user } = useUser(); // <-- Grabbing who is logged in!
  const [challenges, setChallenges] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingChallenges = async () => {
    if (!user?.userId) return; // Safety check
    try {
      const response = await fetch(`http://${LAPTOP_IP}:5282/api/StudyList/clash/pending/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    }
  };

  useFocusEffect(useCallback(() => { fetchPendingChallenges(); }, [user?.userId]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendingChallenges();
    setRefreshing(false);
  };

  const handleAccept = async (clashId: number) => {
    try {
      const response = await fetch(`http://${LAPTOP_IP}:5282/api/StudyList/clash/${clashId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        Alert.alert("⚔️ Clash Accepted!", "Wager matched. The battle is on!");
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setChallenges((prev) => prev.filter(c => c.clashId !== clashId));
      } else {
        Alert.alert("Error", await response.text());
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not reach the server.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="mail-unread-outline" size={28} color="#FAFAFA" />
        <Text style={styles.headerTitle}>INBOX</Text>
      </View>

      {challenges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#27272A" />
          <Text style={styles.emptyText}>No pending challenges.</Text>
          <Text style={styles.emptySubtext}>You are safe... for now.</Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.clashId.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FAFAFA" />}
          renderItem={({ item }) => (
            <View style={styles.challengeCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="flash" size={18} color="#38BDF8" /> 
                <Text style={styles.challengerText}>@{item.challengerUsername} challenged you!</Text>
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.statRow}>
                  <Ionicons name="wallet-outline" size={16} color="#FBBF24" />
                  <Text style={styles.wagerText}>Wager: {item.wagerAmount} Coins</Text>
                </View>
                <View style={styles.statRow}>
                  <Ionicons name="time-outline" size={16} color="#A3A3A3" />
                  <Text style={styles.durationText}>Duration: {item.durationMinutes} Mins</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.clashId)}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{marginRight: 6}} />
                <Text style={styles.acceptBtnText}>Accept Duel</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', paddingHorizontal: 20, paddingTop: 60 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FAFAFA', letterSpacing: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -100 },
  emptyText: { color: '#A3A3A3', fontSize: 18, fontWeight: '600', marginTop: 20 },
  emptySubtext: { color: '#52525B', fontSize: 14, marginTop: 8 },
  challengeCard: { backgroundColor: '#18181B', padding: 24, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#27272A' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  challengerText: { color: '#FAFAFA', fontSize: 16, fontWeight: '700' },
  cardBody: { backgroundColor: '#09090B', padding: 16, borderRadius: 16, marginBottom: 20 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  wagerText: { color: '#FBBF24', fontSize: 14, fontWeight: '600' },
  durationText: { color: '#A3A3A3', fontSize: 14 },
  acceptBtn: { flexDirection: 'row', backgroundColor: '#38BDF8', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#38BDF8', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  acceptBtnText: { color: '#09090B', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});