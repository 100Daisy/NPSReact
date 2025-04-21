import { useColorScheme, Linking, StatusBar } from 'react-native';
import { PaperProvider, Appbar, Portal, Modal, adaptNavigationTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import GamesView from './views/games';
import SettingsView from './views/settings';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { useContext, useEffect, useState } from 'react';
import { trigger } from "react-native-haptic-feedback";
import { NavigationContainer } from '@react-navigation/native';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import DlcsView from './views/dlcs';
import { SettingsContext, SettingsProvider } from './contexts/SettingsContext';

export default function App() {
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

  const getTheme = (scheme) => {
    const colorScheme = useColorScheme();
    const { theme } = useMaterial3Theme();
    
    const { LightTheme, DarkTheme } = adaptNavigationTheme({
      reactNavigationLight: NavigationDefaultTheme,
      reactNavigationDark: NavigationDarkTheme,
    });
    
    const CombinedDefaultTheme = {
      ...MD3LightTheme,
      ...LightTheme,
      colors: {
        ...MD3LightTheme.colors,
        ...theme.light,
      },
      fonts: MD3LightTheme.fonts, // Ensure fonts are included
    };
    const CombinedDarkTheme = {
      ...MD3DarkTheme,
      ...DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
        ...theme.dark,
      },
      fonts: MD3DarkTheme.fonts, // Ensure fonts are included
    };
    if (scheme === 'System') {
      return colorScheme === 'dark'
      ? { ...MD3DarkTheme, colors: theme.dark }
      : { ...MD3LightTheme, colors: theme.light };
    }
    return scheme === 'Dark'
    ? CombinedDarkTheme
    : CombinedDefaultTheme;
  };

  const currentTheme = getTheme(colorScheme);

  return (
    <PaperProvider theme={currentTheme}>
      <NavigationContainer>
        <SafeAreaProvider>
          {showSettings ? (
            <>
            {/* 
              * Statusbar is required here because we do not have tab navigation
              * So Appbar.Header won't cover it for us
              */}
            <StatusBar
              barStyle={currentTheme.dark ? 'light-content' : 'dark-content'}
              backgroundColor="transparent"
              translucent
            />
              <Appbar.Header>
                <Appbar.BackAction onPress={() => {setShowSettings(false)}} />
                <Appbar.Content title="Settings" />
              </Appbar.Header>
              <SettingsView />
            </>
          ) : (
            <>
              <Appbar.Header>
                <Appbar.Content
                  title="NoPayStation"
                  onPress={async () => {
                    const supported = await Linking.canOpenURL('https://nopaystation.com');
                    if (supported) {
                      trigger('effectClick');
                      Linking.openURL('https://nopaystation.com');
                    }
                  } } />
                <Appbar.Action icon="cog" onPress={() => setShowSettings(true)} />
              </Appbar.Header>
              <Tab.Navigator>
                  <Tab.Screen
                    name="Games"
                    component={GamesView}
                    options={{ tabBarIcon: 'gamepad-variant' }} />
                  {showDlcsTab && (
                    <Tab.Screen
                      name="DLC's"
                      component={DlcsView}
                      options={{ tabBarIcon: 'puzzle' }} />
                  )}
              </Tab.Navigator>
            </>
          )}
        </SafeAreaProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}