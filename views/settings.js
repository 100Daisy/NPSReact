import React, { useState,useContext } from 'react';
import {  StyleSheet } from 'react-native';
import { Checkbox, Surface, SegmentedButtons, Button, Text, List } from 'react-native-paper';
import { SettingsContext } from '../contexts/SettingsContext';

const SettingsView = () => {
    const { showDlcsTab, selectedPlatforms, theme, updateSetting } = useContext(SettingsContext);
    const platforms = [
        { value: 'PSV', label: 'PSV' },
        { value: 'PSM', label: 'PSM' },
        { value: 'PSX', label: 'PSX' },
        { value: 'PS3', label: 'PS3' },
        { value: 'PSP', label: 'PSP' },
    ];

    const handleSavePlatforms = (value) => {
        const updatedPlatforms = Array.isArray(value) ? value : [value];
        console.log(updatedPlatforms);
        updateSetting("selectedPlatforms", updatedPlatforms);
    }

    const handleShowDlcsChange = () => {
        updateSetting('showDlcsTab', !showDlcsTab);
    };

    const handleThemeChange = (value) => {
        updateSetting('colorScheme', value);
    };
    return (
        <Surface style={styles.main}>
            <Surface elevation={5} style={styles.surface}>
            <Text variant="labelLarge">Manage navigation</Text>
                {showDlcsTab}
                <Checkbox.Item 
                    label="Show DLC's tab" 
                    status={showDlcsTab ? 'checked' : 'unchecked'} 
                    onPress={() => handleShowDlcsChange()} 
                />
            </Surface>
            <Surface elevation={5} style={styles.surface}>
              <Text variant="labelLarge">Select theme</Text>
              <List.Section>
                  <List.Item
                    title="Light"
                    left={() => <List.Icon icon="white-balance-sunny" />}
                    onPress={() => handleThemeChange('Light')}
                  />
                  <List.Item
                    title="Dark"
                    left={() => <List.Icon icon="brightness-3" />}
                    onPress={() => handleThemeChange('Dark')}
                  />
                  <List.Item
                    title="System"
                    left={() => <List.Icon icon="brightness-auto" />}
                    onPress={() => handleThemeChange('System')}
                  />
                </List.Section>
            </Surface>
            <Surface elevation={5} style={styles.surface}>
              <Text variant="labelLarge">Select platforms to display</Text>
              <SegmentedButtons
                  value={selectedPlatforms}
                  onValueChange={(value) => handleSavePlatforms(value)}
                  multiSelect
                  buttons={platforms}
              />
            </Surface>
                <Button
                    mode="contained"
                    onPress={() => {
                        const githubUrl = "https://github.com/100Daisy/NPSReact";
                        console.log(`Opening GitHub link: ${githubUrl}`);
                        // Add logic to open the URL in a browser if needed
                    }}
                >
                    View on GitHub
                </Button>
        </Surface>
    );
};

const styles = StyleSheet.create({
    main: {
      display: 'flex',
      padding: 8,
      gap: 16,
      height: '100%'
    },
    saveButton: {
        marginTop: 20,
    },
    surface: {
        padding: 16,
        borderRadius: 10,
        display: 'flex',
        gap: 16,
    },
    saveButton: {
        marginVertical: 8,
    }
});

export default SettingsView;
