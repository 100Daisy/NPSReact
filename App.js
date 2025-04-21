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
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import DlcsView from './views/dlcs';
import { SettingsContext, SettingsProvider } from './contexts/SettingsContext';
import { createStackNavigator } from '@react-navigation/stack';


export default function App() {
  return (
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  );
}

function MainApp() {
  const Tab = createMaterialBottomTabNavigator();
  const Stack = createStackNavigator();
  const { colorScheme, showDlcsTab } = useContext(SettingsContext);

  const getTheme = (scheme) => {
    const deviceScheme = useColorScheme();
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
      fonts: MD3LightTheme.fonts,
    };
    const CombinedDarkTheme = {
      ...MD3DarkTheme,
      ...DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
        ...theme.dark,
      },
      fonts: MD3DarkTheme.fonts,
    };
    if (scheme === 'System') {
      return deviceScheme === 'dark'
        ? { ...MD3DarkTheme, colors: theme.dark }
        : { ...MD3LightTheme, colors: theme.light };
    }
    return scheme === 'Dark' ? CombinedDarkTheme : CombinedDefaultTheme;
  };

  const currentTheme = getTheme(colorScheme);

  const TabNavigator = () => {
    const navigation = useNavigation();
  
    return (
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
            }} />
          <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
        </Appbar.Header>
        <Tab.Navigator>
          <Tab.Screen name="Games" component={GamesView} options={{ tabBarIcon: 'gamepad-variant' }} />
          {showDlcsTab && (
            <Tab.Screen name="DLC's" component={DlcsView} options={{ tabBarIcon: 'puzzle' }} />
          )}
        </Tab.Navigator>
      </>
    );
  };
  

  return (
    <PaperProvider theme={currentTheme}>
      <NavigationContainer theme={currentTheme}>
        <SafeAreaProvider>
          <Stack.Navigator
            // screenOptions={{
            //   animation: 'fade', // inne opcje poniżej 👇
            // }}
            >
            <Stack.Screen
              name="Home"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsView}
              options={{
                header: ({ navigation }) => (
                  <>
                    <StatusBar
                      barStyle={currentTheme.dark ? 'light-content' : 'dark-content'}
                      backgroundColor="transparent"
                      translucent
                    />
                    <Appbar.Header>
                      <Appbar.BackAction onPress={() => navigation.goBack()} />
                      <Appbar.Content title="Settings" />
                    </Appbar.Header>
                  </>
                ),
              }}
            />
          </Stack.Navigator>
        </SafeAreaProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}
