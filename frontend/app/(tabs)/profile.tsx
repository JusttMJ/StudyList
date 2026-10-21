import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../UserContext'; // <-- The Brain!

const LAPTOP_IP = '172.27.110.15';

export default function ProfileScreen() {
  const { user } = useUser(); // <-- Grabbing who is logged in!
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user?.userId) return; // Safety check
    try {
      const response = await fetch(`http://${LAPTOP_IP}:5282/api/StudyList/user/${user.userId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Could not fetch stats:", error);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, [user?.userId]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="sync-outline" size={32} color="#38BDF8" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FAFAFA" />}
    >
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{stats.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.usernameText}>@{stats.username}</Text>
        <View style={styles.rankBadge}>
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text style={styles.titleText}>ELITE SCHOLAR</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="diamond-outline" size={24} color="#FBBF24" />
          </View>
          <Text style={styles.statValue}>{stats.coinBalance}</Text>
          <Text style={styles.statLabel}>Focus Coins</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="flame-outline" size={24} color="#FF3366" />
          </View>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="time-outline" size={24} color="#4ade80" />
          </View>
          <Text style={styles.statValue}>{stats.totalStudyMinutes}</Text>
          <Text style={styles.statLabel}>Total Minutes</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="shield-half-outline" size={24} color="#38BDF8" />
          </View>
          <Text style={styles.statValue}>{stats.streakShieldsCount}</Text>
          <Text style={styles.statLabel}>Streak Shields</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', paddingHorizontal: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, backgroundColor: '#09090B', justifyContent: 'center', alignItems: 'center' },
  headerCard: { alignItems: 'center', backgroundColor: '#18181B', paddingVertical: 40, borderRadius: 32, marginBottom: 20, borderWidth: 1, borderColor: '#27272A' },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#27272A', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#3F3F46' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#FAFAFA' },
  usernameText: { fontSize: 24, fontWeight: '800', color: '#FAFAFA', letterSpacing: 1, marginBottom: 8 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBBF2422', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 6 },
  titleText: { fontSize: 12, color: '#FBBF24', fontWeight: '800', letterSpacing: 1.5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  statBox: { width: '47%', backgroundColor: '#18181B', padding: 24, borderRadius: 24, alignItems: 'flex-start', borderWidth: 1, borderColor: '#27272A' },
  statIconWrapper: { backgroundColor: '#09090B', padding: 10, borderRadius: 12, marginBottom: 20 },
  statValue: { fontSize: 32, fontWeight: '200', color: '#FAFAFA', letterSpacing: -1, marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#A3A3A3', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }
});