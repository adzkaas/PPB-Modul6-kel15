import { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MonitoringScreen } from "./src/screens/MonitoringScreen.js";
import { ControlScreen } from "./src/screens/ControlScreen.js";
import { ProfileScreen } from "./src/screens/ProfileScreen.js";
import { SplashScreen } from "./src/screens/SplashScreen.js";
import { assertConfig } from "./src/services/config.js";
import { tokens } from "./src/theme/tokens.js";

const Tab = createBottomTabNavigator();
const { color } = tokens;

enableScreens(true);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    assertConfig();
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: color.bg,
      card: color.surface,
      text: color.text,
      border: color.border,
      primary: color.primary,
    },
  };

  // Full-screen Splash Screen exclusively displayed during initial launch
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0B1120" translucent />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            headerTitle: "LiveTemp",
            headerTitleAlign: "left",
            headerTintColor: color.text,
            headerStyle: {
              backgroundColor: color.surface,
              borderBottomWidth: 1,
              borderBottomColor: color.border,
            },
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 17,
              fontFamily: "monospace",
              letterSpacing: -0.5,
            },
            tabBarActiveTintColor: color.primary,
            tabBarInactiveTintColor: color.text2,
            tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
            tabBarStyle: {
              backgroundColor: color.surface,
              borderTopWidth: 1,
              borderTopColor: color.border,
            },
            tabBarHideOnKeyboard: true,
            tabBarIcon: ({ color: iconColor, focused }) => {
              let iconName = "pulse";
              if (route.name === "Monitoring") {
                iconName = focused ? "pulse" : "pulse-outline";
              } else if (route.name === "Control") {
                iconName = focused ? "options" : "options-outline";
              } else if (route.name === "Profile") {
                iconName = focused ? "person-circle" : "person-circle-outline";
              }
              return <Ionicons name={iconName} size={24} color={iconColor} />;
            },
          })}
        >
          <Tab.Screen
            name="Monitoring"
            component={MonitoringScreen}
            options={{ tabBarLabel: "Monitoring" }}
          />
          <Tab.Screen
            name="Control"
            component={ControlScreen}
            options={{ tabBarLabel: "Control" }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: "Profil",
              headerTitle: "Profil Kelompok",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
