import { useColorScheme, Linking } from 'react-native';
import { PaperProvider, Appbar, Portal, Modal } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import GamesView from './views/games';
import SettingsView from './views/settings';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { useContext, useEffect, useState } from 'react';
import { trigger } from "react-native-haptic-feedback";
import { NavigationContainer } from '@react-navigation/native';
import DlcsView from './views/dlcs';
import { SettingsContext, SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  const Tab = createMaterialBottomTabNavigator();

  return (
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  );
}

function MainApp() {
  const Tab = createMaterialBottomTabNavigator();
  const { colorScheme, showDlcsTab } = useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);
  const { theme } = useMaterial3Theme();

  const getTheme = (scheme) => {
    console.log(scheme)

    return scheme === 'Dark'
    ? { ...MD3DarkTheme, colors: theme.dark }
    : { ...MD3LightTheme, colors: theme.light };
  };

  const currentTheme = getTheme(colorScheme);

  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <PaperProvider theme={currentTheme}>
          <Appbar.Header>
            <Appbar.Content
              title="NoPayStation"
              onPress={async () => {
                const supported = await Linking.canOpenURL('https://nopaystation.com');
                if (supported) {
                  trigger('effectClick');
                  Linking.openURL('https://nopaystation.com');
                }
              }}
            />
            <Appbar.Action icon="cog" onPress={() => setShowSettings(true)} />
          </Appbar.Header>
          <Tab.Navigator>
            <Tab.Screen
              name="Games"
              component={GamesView}
              options={{ tabBarIcon: 'gamepad-variant' }}
            />
            {showDlcsTab && (
              <Tab.Screen
                name="DLC's"
                component={DlcsView}
                options={{ tabBarIcon: 'puzzle' }}
              />
            )}
          </Tab.Navigator>
          <Portal>
            <Modal visible={showSettings} onDismiss={() => setShowSettings(false)}>
              {showSettings && <SettingsView />}
            </Modal>
          </Portal>
        </PaperProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}