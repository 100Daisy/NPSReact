import { StatusBar } from 'expo-status-bar';
import { StyleSheet, FlatList, Clipboard, useColorScheme, Linking } from 'react-native';
import { PaperProvider, Button, Card, Chip, Text, Searchbar, Appbar, Snackbar, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { pickDirectory } from 'react-native-document-picker'
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import { useMaterial3Theme } from '@pchmn/expo-material3-theme';


import Papa from "papaparse"
import { useState, useEffect } from 'react';

export default function App() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();
  const paperTheme =
  colorScheme === 'dark'
    ? { ...MD3DarkTheme, colors: theme.dark }
    : { ...MD3LightTheme, colors: theme.light };
  const styles = StyleSheet.create({
    container: {
      // paddingHorizontal: 20,
      backgroundColor: paperTheme.colors.background,
    },
    item: {
    },
    chip: {
      flex: 1,
      flexDirection: 'row',
    },
    card: {
      borderRadius: 25,
      marginVertical: 10,
    }
  });
  const [value, setValue] = useState('PSV');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSnackbar, setSnackbar] = useState(false);
  const [snackbarText, setSnackbarText] = useState('This is a snackbar');
  const [fetching, setFetching] = useState(true);
  const onChangeSearch = (query) => {
    setFetching(true)
    const filteredData = data.filter((item) => {
      return item["Name"].toLowerCase().includes(query.toLowerCase())
    })
    setFetching(false)
    setFilteredData(filteredData)
    setSearchQuery(query)
  };

  function contentURItoPath(contentURI) {
    // revert url decode
    contentURI = decodeURIComponent(contentURI)
    const path = contentURI.replace('content://com.android.externalstorage.documents/tree/primary:', '/storage/emulated/0/');
    return path
  }
  async function downloadFile(item) {
    await pickDirectory().then((result) => {
      ReactNativeBlobUtil.config({
        addAndroidDownloads : {
            useDownloadManager : true, // <-- this is the only thing required
            notification : true,
            // Optional, override notification setting (default to true)
            // Optional, but recommended since android DownloadManager will fail when
            // the url does not contains a file extension, by default the mime type will be text/plain
            mime : 'text/plain',
            description : 'File downloaded by download manager.',
            path :  contentURItoPath(result.uri) + `/${item["Name"]}.pkg`,
        }
      })
      .fetch('GET', item["PKG direct link"])
      .then((resp) => {
        resp.path()
      })
    }).catch((err) => {
      setSnackbarText(err.message)
      setSnackbar(true)
    })
  }

  function getLatestTSV(console) {
    setSearchQuery('')
    setFilteredData([])
    setFetching(true)
    setValue(console)
    Papa.parse(`https://nopaystation.com/tsv/${console}_GAMES.tsv`, {
      download: true,
      header: true,
      complete: function(results) {
        setData(results.data)
        setFetching(false)
      }
    })
  }
  
  useEffect(() => {
    getLatestTSV('PSV')
  }, []);
  function calculateSize(size) { 
    if (size / (1024 * 1024) > 1024) {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }
    return `${Math.round(size / (1024 * 1024))} MB`
  }

  return (
    <SafeAreaProvider style={ styles.container}>
      <PaperProvider theme={paperTheme}>
        <Appbar.Header style={{ marginHorizontal: 10, marginVertical: 10 }}>
          <Appbar.Content title="NoPayStation" onPress={async () => {
            const supported = await Linking.canOpenURL('https://nopaystation.com');
            if (supported) {
              Linking.openURL('https://nopaystation.com')}
            }
          } />
          <Searchbar
            placeholder="Search"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={{ width: '50%' }}
          />
        </Appbar.Header>
        <SegmentedButtons
            value={value}
            density=''
            onValueChange={getLatestTSV}
            style={{ marginHorizontal: 10, marginTop: 10, }}
            buttons={[
              {
                value: 'PSX',
                label: 'PSX',
              },
              {
                value: 'PSV',
                label: 'PSV',
              },
              {
                value: 'PSP',
                label: 'PSP',
              },
            ]}
          />
          {/* center content of the View to show Activity Indicator at the center of View */}
        <SafeAreaView style={{ marginHorizontal: 10, height: '100%', flex: 1, justifyContent: 'center'}} >
          {
            fetching ? <ActivityIndicator animating={fetching} size='large' /> :
            <FlatList
            // if filteredData exists, use it, otherwise use data
            data={filteredData.length > 0 ? filteredData : data}
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => 
            <Card style={styles.card}>
                <Card.Title title={item['Name']} subtitle={item["Original Name"] ? item["Original Name"] : item["Title ID"]} />
                <Card.Content style={styles.chip}>
                  <Chip style={{ marginRight:10 }}>{item["Region"]}</Chip>
                  <Chip>{calculateSize(item["File Size"])}</Chip>
                </Card.Content>
                <Card.Actions>
                  <Button mode="contained" onPress={() => downloadFile(item)}>Download</Button>
                  {
                    item["zRIF"] ? <Button mode="contained-tonal" onPress={() => Clipboard.setString(item["zRIF"])}>zRIF</Button> : null
                  }
                </Card.Actions>
            </Card>
            }
          />
          }
          <StatusBar style="auto" />
        </SafeAreaView>
        <Snackbar onDismiss={() => setSnackbar(false)} style={ styles.snackbar } visible={showSnackbar}>
            {snackbarText}              
        </Snackbar>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
