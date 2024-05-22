import { useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';


type THook = [boolean, boolean];

interface PermissionsAndroidResponse {
  [key: string]: string;
}

const PERMISSIONS_REQUEST = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
];

const isAllGranted = (res: PermissionsAndroidResponse) => {
  return PERMISSIONS_REQUEST.every((permission) => {
    return res[permission] === PermissionsAndroid.RESULTS.GRANTED;
  });
}

export const useAndroidPermissions = (): THook => {
  const [granted, setGranted] = useState(false);
  const [waiting, setWaiting] = useState(true);

  const doRequest = async () => {
    let granted = false;
    try {
        console.log('looking at permission');
      const res = await PermissionsAndroid.requestMultiple(PERMISSIONS_REQUEST);
      granted = isAllGranted(res);
    } catch (err) {
      console.warn(err);
    }
    console.log('finished looking at permission');
    setWaiting(false);
    setGranted(granted);
  }

  useEffect(() => {
    doRequest();
  }, []);

  return [waiting, granted];
};

// Example of usage
// const [waitingPerm, grantedPerm] = useAndroidPermissions();