import React, { createContext, useState, useEffect } from 'react';
import { getSetting, setSetting, defaultSettings } from '../lib/settingsManager';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [showDlcsTab, setShowDlcsTab] = useState(defaultSettings.showDlcsTab);
    const [colorScheme, setColorScheme] = useState(defaultSettings.colorScheme);
    const [selectedPlatforms, setSelectedPlatforms] = useState(defaultSettings.selectedPlatforms);

    useEffect(() => {
        const loadSettings = async () => {
            const storedShowDlcsTab = await getSetting('showDlcsTab');
            const storedColorScheme = await getSetting('colorScheme');
            const storedSelectedPlatforms = await getSetting('selectedPlatforms');

            if (storedShowDlcsTab !== null) setShowDlcsTab(storedShowDlcsTab);
            if (storedColorScheme) setColorScheme(storedColorScheme);
            if (storedSelectedPlatforms) setSelectedPlatforms(storedSelectedPlatforms);
        };

        loadSettings();
    }, []);

    const updateSetting = async (key, value) => {
        await setSetting(key, value);
        if (key === 'showDlcsTab') setShowDlcsTab(value);
        if (key === 'colorScheme') setColorScheme(value);
        if (key === 'selectedPlatforms') setSelectedPlatforms(value);
    };

    return (
        <SettingsContext.Provider value={{ showDlcsTab, colorScheme, selectedPlatforms, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};