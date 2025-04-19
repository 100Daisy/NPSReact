import { StatusBar } from 'expo-status-bar';
import { StyleSheet, FlatList, Clipboard, useColorScheme, Linking } from 'react-native';
import { Button, Card, Chip, Searchbar, Appbar, Snackbar, SegmentedButtons, ActivityIndicator, Surface } from 'react-native-paper';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Papa from "papaparse"
import { useState, useEffect } from 'react';

import { trigger } from "react-native-haptic-feedback";
export default function GamesView() {
  const [platforms, setPlatforms] = useState([
    {
      value: 'PSV',
      label: 'PSV',
    },
    {
      value: 'PSM',
      label: 'PSM',
    },
    {
      value: 'PSX',
      label: 'PSX',
    },
    {
      value: 'PS3',
      label: 'PS3',
    },
    {
      value: 'PSP',
      label: 'PSP',
    },
  ]);
  const dirs = ReactNativeBlobUtil.fs.dirs

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      display: 'flex',
      gap: 10,
    },
    chip: {
      flex: 1,
      flexDirection: 'row',
    },
    card: {
      borderRadius: 25,
      marginBottom: 10,
    },
    snackbar: {
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

  async function downloadFile(item) {
    trigger('effectClick')
    setSnackbar(true)
    setSnackbarText(`Downloading ${item["Name"]}...`)
    // show all dirs properties
    ReactNativeBlobUtil.config({
      addAndroidDownloads : {
          useDownloadManager : true,
          notification : true,
          path :  `${dirs.LegacyDownloadDir}/NPSReact/${item["Name"]}.pkg`,
      }
    })
    .fetch('GET', item["PKG direct link"])
    .then((resp) => {
      resp.path()
    })
    .catch((err) => {
      trigger('notificationError')
      setSnackbar(true)
      setSnackbarText(`Error downloading ${item["Name"]}`)
    })
  }

  function getLatestTSV(console) {
    trigger('effectClick')
    setSearchQuery('')
    setFilteredData([])
    setFetching(true)
    setValue(console)
    Papa.parse(`https://nopaystation.com/tsv/${console}_DLCS.tsv`, {
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
        <Surface elevation={0} mode='flat' style={styles.container}>
        <Searchbar
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
          loading={fetching}
        />
          <SegmentedButtons
            value={value}
            density=''
            onValueChange={getLatestTSV}
            style={{ marginBottom: 14, marginTop: 10}}
            buttons={platforms}
          />
          <Surface elevation={0} mode='flat'> 
            {
              fetching ? <ActivityIndicator animating={fetching} size='large' /> :
              <FlatList
              // if filteredData exists, use it, otherwise use data
              data={filteredData.length > 0 ? filteredData : data}
              showsVerticalScrollIndicator={false}
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
                      item["zRIF"] ? <Button mode="contained-tonal" onPress={() => {Clipboard.setString(item["zRIF"]); trigger('effectClick')}}>zRIF</Button> : null
                    }
                  </Card.Actions>
              </Card>
              }
            />
            }
          </Surface> 
        <StatusBar style="auto" />
        <Snackbar onDismiss={() => setSnackbar(false)} style={ styles.snackbar } visible={showSnackbar}>
            {snackbarText}              
        </Snackbar>
        </Surface>
    )

}