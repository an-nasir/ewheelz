// mobile/lib/notifications.ts
// Expo push notification helpers — request permission, get token, save preferences

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

// Configure how notifications look while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

/** Request permission + return Expo push token, or null if denied */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    // Android: create a visible notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("price-alerts", {
        name:        "Price Alerts",
        importance:  Notifications.AndroidImportance.HIGH,
        sound:       "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    return token ?? null;
  } catch {
    return null;
  }
}

/** Save push token + optional alert preferences to the server */
export async function savePushToken(
  token: string,
  prefs?: { brand?: string; city?: string; maxPrice?: number }
): Promise<void> {
  try {
    await fetch(`${BASE}/api/push/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, ...prefs }),
    });
  } catch {
    // non-fatal: token stored locally, will retry next launch
  }
}
