import { Capacitor, registerPlugin } from '@capacitor/core';
import { UserState } from '../types';

interface StudyOSWidgetPlugin {
  updateWidgetData(options: {
    streak: string;
    username: string;
    todayFocus: string;
    petStatus: string;
    avatarIcon: string;
  }): Promise<{ success: boolean }>;
}

const StudyOSWidget = registerPlugin<StudyOSWidgetPlugin>('StudyOSWidget');

export async function syncAndroidWidget(userState: UserState | null) {
  if (!userState || !Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const streakVal = userState.academicStudyStreak ?? userState.streak ?? 0;
    const streak = String(streakVal);
    const username = userState.username || "Student";
    
    // Focus hours / mins
    // Use Sweden locale format to get robust YYYY-MM-DD
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const todayMinutes = userState.todayFocusMinutes 
      || (userState.focusHistory && userState.focusHistory[todayStr])
      || 0;
    
    let todayFocus = "0 min";
    if (todayMinutes >= 60) {
      const hrs = Math.floor(todayMinutes / 60);
      const mins = todayMinutes % 60;
      if (mins > 0) {
        todayFocus = `${hrs}h ${mins}m`;
      } else {
        todayFocus = `${hrs} hrs`;
      }
    } else {
      todayFocus = `${todayMinutes} min`;
    }

    // Pet companion status based on study state
    const focusGoal = userState.dailyFocusGoal || 25;
    let petStatus = "Zzz... Complete a study session to wake Mochi!";
    let avatarIcon = userState.avatar || "🐱";

    if (todayMinutes >= focusGoal) {
      petStatus = "Scholar King! Mochi is so proud of you! 🥰👑";
      if (avatarIcon === "🐱") {
        avatarIcon = "🥰";
      }
    } else if (todayMinutes > 0) {
      petStatus = "Mochi is studying with you! Keep it up! 📚🐾";
      if (avatarIcon === "🐱") {
        avatarIcon = "📚";
      }
    } else {
      if (avatarIcon === "🐱") {
        avatarIcon = "😴";
      }
    }

    console.log("[WidgetSync] Syncing native widget data:", {
      streak,
      username,
      todayFocus,
      petStatus,
      avatarIcon
    });

    await StudyOSWidget.updateWidgetData({
      streak,
      username,
      todayFocus,
      petStatus,
      avatarIcon
    });
    console.log("Android native widget updated successfully via Capacitor!");
  } catch (err) {
    console.warn("Failed to synchronize Android native widget:", err);
  }
}
