import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Book, MessageCircle, Settings, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? 
            <BlurView intensity={80} style={StyleSheet.absoluteFill} /> :
            <View style={[StyleSheet.absoluteFill, styles.androidTabBar]} />
        ),
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <Book size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-entry"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.plusButton}>
              <Plus size={32} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ask-buddy"
        options={{
          title: 'Ask Buddy',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 85,
    paddingBottom: 20,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  androidTabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});