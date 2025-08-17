import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS !== 'web';

export const copyToClipboard = async (text) => {
  if (isWeb) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } else {
    const { Clipboard } = require('react-native');
    Clipboard.setString(text);
  }
};

export const triggerHapticFeedback = () => {
  if (isNative) {
    try {
      const { trigger } = require("react-native-haptic-feedback");
      trigger("impactLight");
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }
};

export const downloadFile = async (url, filename) => {
  if (isWeb) {
    try {
      // Fetch the file data
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create object URL and download without DOM manipulation
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = objectUrl;
      link.download = filename;
      link.click();
      
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link method
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    }
  } else {
    const ReactNativeBlobUtil = require('react-native-blob-util').default;
    const dirs = ReactNativeBlobUtil.fs.dirs

    return ReactNativeBlobUtil.config({
      addAndroidDownloads : {
          useDownloadManager : true,
          notification : true,
          path :  `${dirs.LegacyDownloadDir}/NPSReact/${filename}`,
      }
    }).fetch('GET', url);
  }
};

export const fetchData = async (url) => {
  if (isWeb) {
    const response = await fetch(url);
    return response.text();
  } else {
    const ReactNativeBlobUtil = require('react-native-blob-util').default;
    const response = await ReactNativeBlobUtil.fetch('GET', url);
    return response.text();
  }
};
