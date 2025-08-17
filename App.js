import { PaperProvider, Appbar, BottomNavigation } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import ReaderView from './views/reader';
import SettingsView from './views/settings';
import { useContext, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { SettingsContext, SettingsProvider } from './contexts/SettingsContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getTheme } from './lib/themeUtils';
import * as SystemUI from 'expo-system-ui';

export default function App() {
  return (
    <SettingsProvider>
      <StatusBar style="auto" />
      <MainApp />
    </SettingsProvider>
  );
}

function MainApp() {
  const Stack = createNativeStackNavigator();
  const { colorScheme, showDlcsTab } = useContext(SettingsContext);

  const theme = getTheme(colorScheme);
  SystemUI.setBackgroundColorAsync(theme.colors.background);

  const HomeView = () => {
    const navigation = useNavigation();
    const [index, setIndex] = useState(0);
    
    const routes = [
      { key: 'games', title: 'Games', focusedIcon: 'gamepad-variant' },
      ...(showDlcsTab ? [{ key: 'dlcs', title: "DLC's", focusedIcon: 'puzzle' }] : [])
    ];

    const GamesScene = () => <ReaderView route={{ params: { type: "GAMES" } }} />;
    const DLCsScene = () => <ReaderView route={{ params: { type: "DLCS" } }} />;

    const renderScene = BottomNavigation.SceneMap({
      games: GamesScene,
      ...(showDlcsTab ? { dlcs: DLCsScene } : {})
    });
  
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="NoPayStation" />
          <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
        </Appbar.Header>
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />
      </>
    );
  };
  

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeView}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsView}
            options={{
              header: ({ navigation }) => (
                <>
                  <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Settings" />
                  </Appbar.Header>
                </>
              ),
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
