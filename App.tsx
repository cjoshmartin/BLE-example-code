import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Text, Button, Layout, List } from '@ui-kitten/components';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { BleManager, Device } from 'react-native-ble-plx';
import { useAndroidPermissions } from './useAndroidPermissions';
import {  btoa } from "react-native-quick-base64";
import LightButton from './compoents/LightButton';
import LightSlider from './compoents/LightSlider';

const bleManager = new BleManager();

const  SERVICE_UUID = "ab49b033-1163-48db-931c-9c2a3002ee1d";
const  TOGGLES_LOT_CHARACTERISTIC_UUID = "5bc6df48-8953-4fa6-a3a9-639ef83f7fe7";
const  ALL_LOT_CHARACTERISTIC_UUID = "605e066d-809a-44e2-8776-11d31ba100a2";


export default function App() {
  const [hasPermissions, setHasPermissions] = useState<boolean>(Platform.OS == 'ios');
  const [waitingPerm, grantedPerm] = useAndroidPermissions();
  const [devices, setDevices] = useState({});
  const [device, setDevice] = useState<Device | null>(null);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState("Searching...");

  const [adj1, setAdj1] = useState(0);
  const [adj2, setAdj2] = useState(0);
  const [adj3, setAdj3] = useState(0);
  const [adj4, setAdj4] = useState(0);

  const LAMP_TOGGLE_1_MASK = 0b1000;
  const LAMP_TOGGLE_2_MASK = 0b0100;
  const LAMP_TOGGLE_3_MASK = 0b0010;
  const LAMP_TOGGLE_4_MASK = 0b0001;

  const [toggles, setToggles] = useState(0);


  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  useEffect(() => {
    if (!device || !device.isConnected){
      return;
    }

      const testData = JSON.stringify([
        adj1,
        adj2,
        adj3,
        adj4,
      ]);
      console.log("Sending array of test data...");
      device
        .writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          ALL_LOT_CHARACTERISTIC_UUID,
          btoa(testData)
        )
        .catch((e) => {});

  }, [device, adj1, adj2, adj3, adj4])

  useEffect(() => {
    if (!device || !device.isConnected){
      return;
    }
      console.log("Sending array of test data...");
      device
        .writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          TOGGLES_LOT_CHARACTERISTIC_UUID,
          btoa(String(toggles))
        )
        .catch((e) => {});

  }, [device, toggles])

  useEffect(() => {
    if (!(Platform.OS == 'ios')){
      setHasPermissions(grantedPerm);
    }
  }, [grantedPerm])

  useEffect(() => {
    if(hasPermissions && !isConnected){
      searchAndConnectToDevice();
    }
  }, [hasPermissions, isConnected]);

  const devicesRef = useRef({});
  const devicesRefreshIntervalRef = useRef(0);

  const searchAndConnectToDevice = () => {
    bleManager.startDeviceScan([SERVICE_UUID], {allowDuplicates: false}, (error, device) => {

      if (error) {
        console.error(error);
        setIsConnected(false);
        setConnectionStatus("Error searching for devices");
        return;
      }
      if (device?.name){
        devicesRef.current
        if(!devicesRef.current) {
          devicesRef.current = {};
        }
        else {
          //@ts-ignore
          devicesRef.current[device.name] = device
        }
      }
    });
    
    const id = setInterval(() => {
          console.log('refreshing list to be: ', Object.keys(devicesRef?.current))
          const values = Object.values(devicesRef?.current)
              //@ts-ignore
              .sort((a, b) => Number(b.rssi) - Number(a.rssi))
              .filter((value, i) => i < 20)

          setDevices(values);
        }, 3000)
    //@ts-ignore
      devicesRefreshIntervalRef.current = id;
  }

    const connectToDevice = async (device: Device) => {
      bleManager.stopDeviceScan();
      clearInterval(devicesRefreshIntervalRef.current);
      devicesRefreshIntervalRef.current = 0;
      try {
      const _device = await bleManager.connectToDevice(device.id, undefined); 
       // require to make all services and Characteristics accessable
      await _device.discoverAllServicesAndCharacteristics();
      setConnectionStatus("Connected");
      setIsConnected(true);
      setDevice(_device);
      } catch (error){
          console.error(error)
          setConnectionStatus("Error in Connection");
          setIsConnected(false);
      }
    };

    useEffect(() => {
      if (!device) {
        return;
      }

      const subscription = bleManager.onDeviceDisconnected(
        device.id,
        (error, device) => {
          if (error) {
            console.log("Disconnected with error:", error);
          }
          setConnectionStatus("Disconnected");
          setIsConnected(false);
          console.log("Disconnected device");
          if (device) {
            setConnectionStatus("Reconnecting...");
            connectToDevice(device)
              .then(() => {
                setConnectionStatus("Connected");
                setIsConnected(true);
              })
              .catch((error) => {
                console.log("Reconnection failed: ", error);
                setConnectionStatus("Reconnection failed");
                setIsConnected(false);
                setDevice(null);
              });
          }
        }
      );

      return () => subscription.remove();
    }, [device]);

    function Item (props: any){
      const {id, name, rssi} = props.item;

      return (
        <Button 
        key={id}
          onPress={() =>{
                setConnectionStatus("Connecting...");
                connectToDevice(props.item);
          }}
          style={{
            padding: 16,
            marginBottom: 10,
          }}
        >
          <Text >{name} // {rssi}</Text>
        </Button>
      );
    }

  return (
    <ApplicationProvider {...eva} theme={eva.dark}>
    <Layout style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {!hasPermissions && (
        <View>
          <Text>Looks like you have not enabled Permission for BLE</Text>
        </View>
      )}
      {hasPermissions && !isConnected && (
        <SafeAreaView
          style={{
            flex: 1,
            //@ts-ignore
            marginTop: 50,
          }}
        >
          <Text style={{ marginBottom: 14 }} category='h1'>
            Device connection list
          </Text>
          <List
          //@ts-ignore
            data={devices}
            renderItem={Item}
          />
        </SafeAreaView>
      )}
      {hasPermissions && 
      isConnected &&
       (
        <View style={{margin: 30}}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
            category='h2'
              style={{
                marginBottom: 10,
              }}
            >
              Toggleable Lights
            </Text>
            <View style={{ flex: 0.5, flexDirection: "row", gap: 5 }}>
              <LightButton
                name={"Bedroom"}
                value={toggles}
                onChange={(value: any) => setToggles(value)}
                mask={LAMP_TOGGLE_1_MASK}
              />
              <LightButton name={"Kitchen"} 
                value={toggles}
                onChange={(value: any) => setToggles(value)}
                mask={LAMP_TOGGLE_2_MASK}
              />
              <LightButton name={"Basement"} 
                value={toggles}
                onChange={(value: any) => setToggles(value)}
                mask={LAMP_TOGGLE_3_MASK}
              />
              <LightButton name={"Office"} 
                value={toggles}
                onChange={(value: any) => setToggles(value)}
                mask={LAMP_TOGGLE_4_MASK}
              />
            </View>
          </View>
          <View style={{ flex: 3 }}>
            <Text
              style={{
                marginBottom: 10,
              }}
              category='h2'
            >
              Adjustable Lights
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LightSlider
                name="Kid's Room"
                value={adj1}
                onChange={(value: number) => setAdj1(value)}
              />
              <LightSlider
                name="Front Porch"
                value={adj2}
                onChange={(value: number) => setAdj2(value)}
              />
              <LightSlider
                name="Back Porch"
                value={adj3}
                onChange={(value: number) => setAdj3(value)}
              />
              <LightSlider
                name="Garage"
                value={adj4}
                onChange={(value: number) => setAdj4(value)}
              />
            </View>
          </View>
        </View>
      )}
      <StatusBar style="auto" />
    </Layout>
</ApplicationProvider>
  );
}