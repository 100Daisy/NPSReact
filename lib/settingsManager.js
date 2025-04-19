import AsyncStorage from '@react-native-async-storage/async-storage';
export const defaultSettings = {
    colorScheme: 'System',
    showDlcsTab: true,
    platforms: []
};

export const getSetting = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            console.log(`settings: read: ${key}: ${JSON.parse(value)}`)
            return JSON.parse(value);
        }
        
        return defaultSettings[key];
    } catch (error) {
        console.error('Error getting setting:', error);
        return defaultSettings[key];
    }
};

export const setSetting = async (key, value) => {
    try {
        console.log(`settings: write: ${key}: ${value}`)
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error setting value:', error);
    }
};