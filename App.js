import { PaperProvider, Appbar } from 'react-native-paper';
import ReaderView from './views/reader';
import SettingsView from './views/settings';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { useContext } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { SettingsContext, SettingsProvider } from './contexts/SettingsContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getTheme } from './lib/themeUtils';
import * as SystemUI from 'expo-system-ui';

export default function App() {
  return (
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  );
}

function MainApp() {
  const Tab = createMaterialBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  const { colorScheme, showDlcsTab } = useContext(SettingsContext);

  const theme = getTheme(colorScheme);
  SystemUI.setBackgroundColorAsync(theme.colors.background);

  const HomeView = () => {
    const navigation = useNavigation();
  
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="NoPayStation" />
          <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
        </Appbar.Header>
        <Tab.Navigator>
          <Tab.Screen 
            name="Games" 
            component={ReaderView} 
            options={{ tabBarIcon: 'gamepad-variant' }}
            initialParams={{ type: "GAMES" }} />
          {showDlcsTab && (
            <Tab.Screen 
            name="DLC's" 
            component={ReaderView} 
            options={{ tabBarIcon: 'puzzle' }}
            initialParams={{ type: "DLCS" }} />
          )}
        </Tab.Navigator>
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
