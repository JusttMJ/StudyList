import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

// 1. IMPORT THE GLOBAL BRAIN!
import { useUser } from '../UserContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LAPTOP_IP = '172.27.110.15'; // <-- Make sure this matches your laptop's IP address on the local network!
// We deleted MY_USER_ID = 1 here!

export default function TimerScreen() {
  // 2. GRAB THE LOGGED-IN USER ID FROM THE BRAIN!
  const { user } = useUser(); 

  const [secondsLeft, setSecondsLeft] = useState(5); 
  const [isActive, setIsActive] = useState(false);
  const [wagerAmount, setWagerAmount] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [currentBattle, setCurrentBattle] = useState<any>(null);

  const fetchActiveBattles = async () => {
    try {
      // 3. USE user?.userId INSTEAD OF THE HARDCODED ID!
      const response = await fetch(`http://${LAPTOP_IP}:5282/api/StudyList/clash/active/${user?.userId}`);
      if (response.ok) {
        const data = await response.json();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveBattles(data);
      }
    } catch (error) {
      console.log("Could not fetch active battles.");
    }
  };

// ... (The rest of your TimerScreen code stays exactly the same!)
// Just make sure to also change MY_USER_ID to user?.userId inside handleSessionComplete and handleSendChallenge!

  useFocusEffect(useCallback(() => { fetchActiveBattles(); }, []));
  const handleSessionComplete = async () => {
    try {
      const response = await fetch(`http://${LAPTOP_IP}:5282/api/StudyList/session/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId, // <--- Replaced MY_USER_ID here!
          durationMinutes: 25, 
          wasCompleted: true,
          subject: currentBattle ? `Battle vs ${currentBattle.opponentName}` : "Solo Focus",
          clashId: currentBattle ? currentBattle.clashId : null 
        })
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          currentBattle ? `🏆 VICTORY!` : "✨ Focus Complete", 
          `💰 +${data.newBalance} Coins\n🔥 Streak: ${data.currentStreak} Day(s)`
        );
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCurrentBattle(null); 
        fetchActiveBattles();   
      }

    } catch (error) {
      Alert.alert("Network Error", "Could not log session.");
    }
  };
  useEffect(() => {
    let interval: number | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000) as any;
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      if (interval !== null) clearInterval(interval);
      handleSessionComplete();
    }
    return () => { if (interval !== null) clearInterval(interval); };
  }, [isActive, secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setSecondsLeft(5); };

  const handleSendChallenge = async () => {
    if (!targetUser || !wagerAmount) return Alert.alert("Wait", "Enter opponent and wager.");
    try {
      const response = await fetch(`http://${LAPTOP_IP}:5282/api/StudyList/clash/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          challengerId: user?.userId, // <--- Replaced MY_USER_ID here!
          targetUsername: targetUser, 
          wagerAmount: parseInt(wagerAmount), 
          durationMinutes: 25
        })
      });
      if (response.ok) {
        Alert.alert("Challenge Sent", `Awaiting response from ${targetUser}.`);
        setTargetUser(''); setWagerAmount('');
      } else Alert.alert("Error", await response.text());
    } catch (error) {
      Alert.alert("Error", "Server unreachable.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Dynamic Header */}
      <View style={styles.headerContainer}>
        <Ionicons name={currentBattle ? "flame" : "leaf-outline"} size={24} color={currentBattle ? "#FF3366" : "#4ade80"} />
        <Text style={[styles.headerModeText, currentBattle && styles.headerBattleText]}>
          {currentBattle ? `VS ${currentBattle.opponentName.toUpperCase()}` : "DEEP FOCUS"}
        </Text>
      </View>

      {/* Premium Zen / Battle Timer */}
      <View style={[styles.timerWrapper, currentBattle && styles.battleTimerWrapper]}>
        <Text style={[styles.timerText, currentBattle && styles.battleTimerText]}>
          {formatTime(secondsLeft)}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.primaryBtn, isActive ? styles.stopBtn : (currentBattle ? styles.battleStartBtn : styles.startBtn)]} 
            onPress={toggleTimer}
          >
            <Ionicons name={isActive ? "pause" : "play"} size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.btnText}>{isActive ? "Pause" : "Start"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={resetTimer}>
            <Ionicons name="refresh" size={20} color="#A3A3A3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Radar */}
      {activeBattles.length > 0 && (
        <View style={styles.radarCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="radio-outline" size={20} color="#FF3366" />
            <Text style={styles.cardTitleBattle}>ACTIVE BATTLES</Text>
          </View>
          {activeBattles.map((battle) => (
            <View key={battle.clashId} style={styles.radarItem}>
              <View>
                <Text style={styles.radarOpponent}>@{battle.opponentName}</Text>
                <Text style={styles.radarWager}>Wager: {battle.wagerAmount} Coins</Text>
              </View>
              <TouchableOpacity 
                style={styles.engageBtn} 
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setCurrentBattle(battle);
                }}
              >
                <Text style={styles.engageBtnText}>Engage</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Premium Challenge Input */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="game-controller-outline" size={20} color="#F5F5F5" />
          <Text style={styles.cardTitle}>NEW STUDY CLASH</Text>
        </View>
        <TextInput 
          style={styles.input} placeholder="Opponent Username" placeholderTextColor="#737373"
          value={targetUser} onChangeText={setTargetUser} autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} placeholder="Wager Amount" placeholderTextColor="#737373"
          value={wagerAmount} onChangeText={setWagerAmount} keyboardType="numeric"
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSendChallenge}>
          <Text style={styles.submitBtnText}>Issue Challenge</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' }, // Deep OLED Black
  scrollContent: { alignItems: 'center', paddingTop: 60, paddingBottom: 50, paddingHorizontal: 20 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, gap: 8 },
  headerModeText: { color: '#4ade80', fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  headerBattleText: { color: '#FF3366' },
  
  // Timer Ring/Wrapper
  timerWrapper: { 
    alignItems: 'center', justifyContent: 'center', marginBottom: 50,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#18181B', // Subtle raised circle
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  battleTimerWrapper: {
    backgroundColor: '#1A0B10', // Dark crimson tint
    borderWidth: 1, borderColor: '#FF336633',
    shadowColor: '#FF3366', shadowOpacity: 0.2, shadowRadius: 30,
  },
  timerText: { fontSize: 72, fontWeight: '200', color: '#FAFAFA', letterSpacing: -2, marginBottom: 20 },
  battleTimerText: { color: '#FF3366', fontWeight: 'bold' },
  
  // Buttons
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30 },
  startBtn: { backgroundColor: '#4ade80' },
  battleStartBtn: { backgroundColor: '#FF3366' },
  stopBtn: { backgroundColor: '#3F3F46' },
  secondaryBtn: { backgroundColor: '#27272A', padding: 14, borderRadius: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },

  // Cards
  card: { width: '100%', backgroundColor: '#18181B', padding: 24, borderRadius: 24, marginBottom: 20 },
  radarCard: { width: '100%', backgroundColor: '#1A0B10', padding: 24, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#FF336633' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  cardTitle: { color: '#FAFAFA', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  cardTitleBattle: { color: '#FF3366', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  
  radarItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090B', padding: 16, borderRadius: 16, marginBottom: 10 },
  radarOpponent: { color: '#FAFAFA', fontSize: 16, fontWeight: '600' },
  radarWager: { color: '#A3A3A3', fontSize: 13, marginTop: 4 },
  engageBtn: { backgroundColor: '#FF336622', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FF3366' },
  engageBtnText: { color: '#FF3366', fontWeight: '700' },

  input: { backgroundColor: '#09090B', color: '#FAFAFA', padding: 18, borderRadius: 16, marginBottom: 12, fontSize: 16, fontWeight: '500' },
  submitBtn: { backgroundColor: '#FAFAFA', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#09090B', fontSize: 16, fontWeight: '800', letterSpacing: 1 }
});