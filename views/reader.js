import { StyleSheet, FlatList, useColorScheme, Linking, Platform } from 'react-native';
import { Button, Card, Chip, Searchbar, Appbar, Snackbar, SegmentedButtons, ActivityIndicator, Surface } from 'react-native-paper';
import Papa from "papaparse"
import { useState, useEffect, useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { copyToClipboard, triggerHapticFeedback, downloadFile, fetchData } from '../lib/platformUtils';
export default function ReaderView({ route }) {
  const type = route?.params?.type || "GAMES";
  const { selectedPlatforms, serverUrl } = useContext(SettingsContext);
  const [platforms, setPlatforms] = useState(
    [
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
    ]
  );

  useEffect(() => {
    if (selectedPlatforms && selectedPlatforms.length > 0) {
      const allPlatforms = [
        { value: 'PSV', label: 'PSV' },
        { value: 'PSM', label: 'PSM' },
        { value: 'PSX', label: 'PSX' },
        { value: 'PS3', label: 'PS3' },
        { value: 'PSP', label: 'PSP' },
      ];
      const filteredPlatforms = allPlatforms.filter(platform =>
        selectedPlatforms.includes(platform.value)
      );
      setPlatforms(filteredPlatforms);
    }
  }, [selectedPlatforms]);

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      display: 'flex',
      gap: 10,
      ...(Platform.OS === 'web' && { height: '100vh' })
    },
    chip: {
      flex: 1,
      flexDirection: 'row',
    },
    listContainer: {
      ...(Platform.OS === 'web' && { 
        height: 'calc(100vh - 200px)', // Odejmujemy wysokość search bar i segmented buttons
        overflow: 'auto'
      })
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

  async function downloadGameFile(item) {
    if (item["PKG direct link"] === "MISSING") {
      triggerHapticFeedback()
      setSnackbar(true)
      setSnackbarText(`No download link for ${item["Name"]}`)
      return
    }
    triggerHapticFeedback()
    setSnackbar(true)
    setSnackbarText(`Downloading ${item["Name"]}...`)
    
    try {
      await downloadFile(item["PKG direct link"], `${item["Name"]}.pkg`);
      setSnackbarText(`Downloaded ${item["Name"]} successfully!`)
    } catch (err) {
      triggerHapticFeedback()
      setSnackbar(true)
      setSnackbarText(`Error downloading ${item["Name"]}`)
    }
  }

  function getLatestTSV(console) {
    triggerHapticFeedback()
    setSearchQuery('')
    setFilteredData([])
    setFetching(true)
    setValue(console)
    Papa.parse(`${serverUrl}/tsv/${console}_${type}.tsv`, {
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
    } else if (size / 1024 > 1024) {
      return `${Math.round(size / (1024 * 1024))} MB`
    }
    return `${Math.round(size / 1024)} KB`
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
          <Surface elevation={0} mode='flat' style={styles.listContainer}> 
            {
              fetching ? <ActivityIndicator animating={fetching} size='large' /> :
              <FlatList
              // if filteredData exists, use it, otherwise use data
              data={filteredData.length > 0 ? filteredData : data}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 20, ...(Platform.OS === 'web' && { minHeight: '100%' }) }}
              style={Platform.OS === 'web' ? { height: '100%' } : {}}
              renderItem={({item}) => 
              <Card>
                  <Card.Title title={item['Name']} subtitle={item["Original Name"] ? item["Original Name"] : item["Title ID"]} />
                  <Card.Content style={styles.chip}>
                    <Chip style={{ marginRight:10 }}>{item["Region"]}</Chip>
                    <Chip>{calculateSize(item["File Size"])}</Chip>
                  </Card.Content>
                  <Card.Actions>
                    <Button mode="contained" onPress={() => downloadGameFile(item)}>Download</Button>
                    {
                      item["zRIF"] ? <Button mode="contained-tonal" onPress={() => {copyToClipboard(item["zRIF"]); triggerHapticFeedback()}}>zRIF</Button> : null
                    }
                  </Card.Actions>
              </Card>
              }
            />
            }
          </Surface> 
        </Surface>
    )

}