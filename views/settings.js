import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Linking, ScrollView, Platform } from 'react-native';
import { Checkbox, Surface, SegmentedButtons, IconButton, Text, List, Icon, TextInput } from 'react-native-paper';
import { SettingsContext } from '../contexts/SettingsContext';

const SettingsView = ({ navigation }) => {
    const { showDlcsTab, selectedPlatforms, theme, serverUrl, updateSetting } = useContext(SettingsContext);

    // Local state for instant UI updates
    const [localShowDlcsTab, setLocalShowDlcsTab] = useState(showDlcsTab);
    const [localSelectedPlatforms, setLocalSelectedPlatforms] = useState(selectedPlatforms);
    const [localTheme, setLocalTheme] = useState(theme);
    const [localServerUrl, setLocalServerUrl] = useState(serverUrl);

    // Save settings when exiting the screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            updateSetting('showDlcsTab', localShowDlcsTab);
            updateSetting('selectedPlatforms', localSelectedPlatforms);
            updateSetting('serverUrl', localServerUrl);
        });

        return unsubscribe;
    }, [navigation, localShowDlcsTab, localSelectedPlatforms, localTheme, localServerUrl, updateSetting]);

    // Handle browser back button (web only)
    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleBrowserBack = (event) => {
                // Save settings before navigating back
                updateSetting('showDlcsTab', localShowDlcsTab);
                updateSetting('selectedPlatforms', localSelectedPlatforms);
                updateSetting('serverUrl', localServerUrl);
                
                // Navigate back in the app
                navigation.goBack();
            };

            // Add popstate listener for browser back button
            window.addEventListener('popstate', handleBrowserBack);

            // Push a new state when entering settings to enable back navigation
            window.history.pushState({ page: 'settings' }, 'Settings', window.location.href);

            return () => {
                window.removeEventListener('popstate', handleBrowserBack);
            };
        }
    }, [navigation, localShowDlcsTab, localSelectedPlatforms, localServerUrl, updateSetting]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Surface style={styles.surface}>
                <Text variant="labelLarge">Manage navigation</Text>
                <Checkbox.Item
                    label="Show DLC's tab"
                    status={localShowDlcsTab ? 'checked' : 'unchecked'}
                    onPress={() => setLocalShowDlcsTab(!localShowDlcsTab)}
                />
            </Surface>
            <Surface style={styles.surface}>
                <Text variant="labelLarge">Select theme</Text>
                <List.Section>
                    <List.Item
                        title="Light"
                        left={() => <List.Icon icon="white-balance-sunny" />}
                        rippleColor="transparent" // Disable default ripple effect
                        onPress={() => {
                            setLocalTheme('Light');
                            updateSetting('colorScheme', 'Light'); // Update context immediately
                        }}
                    />
                    <List.Item
                        title="Dark"
                        left={() => <List.Icon icon="brightness-3" />}
                        rippleColor="transparent" // Disable default ripple effect
                        onPress={() => {
                            setLocalTheme('Dark');
                            updateSetting('colorScheme', 'Dark'); // Update context immediately
                        }}
                    />
                    <List.Item
                        title="System"
                        left={() => <List.Icon icon="brightness-auto" />}
                        rippleColor="transparent" // Disable default ripple effect
                        onPress={() => {
                            setLocalTheme('System');
                            updateSetting('colorScheme', 'System'); // Update context immediately
                        }}
                    />
                </List.Section>
            </Surface>
            <Surface style={styles.surface}>
                <Text variant="labelLarge">Select platforms to display</Text>
                <SegmentedButtons
                    value={localSelectedPlatforms}
                    onValueChange={(value) => setLocalSelectedPlatforms(Array.isArray(value) ? value : [value])}
                    multiSelect
                    buttons={[
                        { value: 'PSV', label: 'PSV' },
                        { value: 'PSM', label: 'PSM' },
                        { value: 'PSX', label: 'PSX' },
                        { value: 'PS3', label: 'PS3' },
                        { value: 'PSP', label: 'PSP' },
                    ]}
                />
            </Surface>
            <Surface style={styles.surface}>
                <Text variant="labelLarge">Server Configuration</Text>
                <TextInput
                    label="Server URL"
                    value={localServerUrl}
                    onChangeText={setLocalServerUrl}
                    mode="outlined"
                    placeholder="http://nopaystation.com"
                    right={<TextInput.Icon icon="server" />}
                />
            </Surface>
            <IconButton
                icon="github"
                style={{ alignSelf: 'center' }}
                mode="contained"
                onPress={() => Linking.openURL('https://www.github.com/100Daisy/NPSReact')}
            />    
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        padding: 8,
        gap: 20,
        paddingBottom: 50, // Extra padding at bottom for last element
    },
    surface: {
        padding: 16,
        borderRadius: 10,
        display: 'flex',
        gap: 10,
    },
});

export default SettingsView;