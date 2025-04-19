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
        updateSetting("platforms", value)
    }

    const handleShowDlcsChange = () => {
        updateSetting('showDlcsTab', !showDlcsTab);
    };

    const handleThemeChange = (value) => {
        updateSetting('colorScheme', value);
    };
    return (
        <Surface elevation={5} style={styles.main}>
            {showDlcsTab}
            <Checkbox.Item 
                label="Show DLC's tab" 
                status={showDlcsTab ? 'checked' : 'unchecked'} 
                onPress={() => handleShowDlcsChange()} 
            />
            <Surface style={styles.surface}>
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
            <Surface style={styles.surface}>
              <Text variant="labelLarge">Select platforms to be displayed (reload app)</Text>
              <SegmentedButtons
                  value={selectedPlatforms}
                  onValueChange={(value) => handleSavePlatforms(value)}
                  multiSelect
                  buttons={platforms}
              />
            </Surface>
        </Surface>
    );
};

const styles = StyleSheet.create({
    main: {
      display: 'flex',
      padding: 8,
      margin: 16,
      borderRadius: 10,
      gap: 16,

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
