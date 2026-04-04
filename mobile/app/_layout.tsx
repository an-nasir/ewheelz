// app/_layout.tsx — Root layout for eWheelz mobile
// Registers for push notifications on first launch
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";
import { registerForPushNotifications, savePushToken } from "@/lib/notifications";

async function initPushNotifications() {
  try {
    // Only register once — skip if token already saved this install
    const saved = await AsyncStorage.getItem("pushToken");
    const token = await registerForPushNotifications();
    if (token && token !== saved) {
      await savePushToken(token);
      await AsyncStorage.setItem("pushToken", token);
    }
  } catch {
    // non-fatal
  }
}

export default function RootLayout() {
  useEffect(() => {
    initPushNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="ev/[slug]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            headerTintColor: Colors.white,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="article/[slug]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            headerTintColor: Colors.text,
            headerStyle: { backgroundColor: Colors.white },
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="scan"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
            presentation: "modal",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
