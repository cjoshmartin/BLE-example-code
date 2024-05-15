import { StatusBar } from 'expo-status-bar';
import { PermissionsAndroid, Platform, Text, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      {
        title: "Location permission for bluetooth scanning",
        message:
          "Grant location permission to allow the app to scan for Bluetooth devices",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Location permission for bluetooth scanning granted");
    } else {
      console.log("Location permission for bluetooth scanning denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

if (Platform.OS !== 'ios'){
  requestLocationPermission();
}


export default function App() {
  return (
    <View>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}