// app/(tabs)/_layout.tsx — Bottom tab navigator
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Platform } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: Array<{
  name: string;
  title: string;
  icon: IconName;
  iconActive: IconName;
}> = [
  { name: "index",     title: "Home",      icon: "home-outline",      iconActive: "home" },
  { name: "evs",       title: "EVs",       icon: "car-outline",       iconActive: "car" },
  { name: "charging",  title: "Chargers",  icon: "flash-outline",     iconActive: "flash" },
  { name: "articles",  title: "News",      icon: "newspaper-outline", iconActive: "newspaper" },
  { name: "community", title: "Community", icon: "people-outline",    iconActive: "people" },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
