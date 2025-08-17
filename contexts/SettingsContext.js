import React, { createContext, useState, useEffect } from 'react';
import { getSetting, setSetting, defaultSettings } from '../lib/settingsManager';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [showDlcsTab, setShowDlcsTab] = useState(defaultSettings.showDlcsTab);
    const [colorScheme, setColorScheme] = useState(defaultSettings.colorScheme);
    const [selectedPlatforms, setSelectedPlatforms] = useState(defaultSettings.selectedPlatforms);
    const [serverUrl, setServerUrl] = useState(defaultSettings.serverUrl);

    useEffect(() => {
        const loadSettings = async () => {
            const storedShowDlcsTab = await getSetting('showDlcsTab');
            const storedColorScheme = await getSetting('colorScheme');
            const storedSelectedPlatforms = await getSetting('selectedPlatforms');
            const storedServerUrl = await getSetting('serverUrl');

            if (storedShowDlcsTab !== null) setShowDlcsTab(storedShowDlcsTab);
            if (storedColorScheme) setColorScheme(storedColorScheme);
            if (storedSelectedPlatforms) setSelectedPlatforms(storedSelectedPlatforms);
            if (storedServerUrl) setServerUrl(storedServerUrl);
        };

        loadSettings();
    }, []);

    const updateSetting = async (key, value) => {
        await setSetting(key, value);
        if (key === 'showDlcsTab') setShowDlcsTab(value);
        if (key === 'colorScheme') setColorScheme(value);
        if (key === 'selectedPlatforms') setSelectedPlatforms(value);
        if (key === 'serverUrl') setServerUrl(value);
    };

    return (
        <SettingsContext.Provider value={{ showDlcsTab, colorScheme, selectedPlatforms, serverUrl, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};