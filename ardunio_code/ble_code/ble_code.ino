#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <string>
#include <iostream>

BLEServer *pServer;
#define DEVICE_NAME "MyESP32"
#define SERVICE_UUID "ab49b033-1163-48db-931c-9c2a3002ee1d"

BLECharacteristic *pStepCountCharacteristic;
#define STEPCOUNT_CHARACTERISTIC_UUID "fbb6411e-26a7-44fb-b7a3-a343e2b011fe"

int heartRate = 0;
BLECharacteristic *pHeartRateCharacteristic;
# define HEARTRATE_CHARACTERISTIC_UUID "c58b67c8-f685-40d2-af4c-84bcdaf3b22e"

int readValue(BLECharacteristic *characteristic) {
  if (characteristic == NULL) {
    return -1;
  }
  std::string value = std::string(
      (
        characteristic->getValue()
      ).c_str()
    );

  try{
    return stoi(value);
  } catch(...) {
    return -1;
  }
}

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
    }
};


bool deviceConnected = false;
bool oldDeviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Connected from device");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Disconnected from device");
    }
};


BLECharacteristic* createCharacteristic(char* characteristicUuid, BLEService *pService)
{
  BLECharacteristic *characteristic = pService->createCharacteristic( 
                                         characteristicUuid,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_NOTIFY |
                                         BLECharacteristic::PROPERTY_WRITE
                                       );
  characteristic->addDescriptor(new BLE2902());
  characteristic->setCallbacks(new MyCallbacks());
  return characteristic;
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  while(!Serial);
  BLEDevice::init(DEVICE_NAME);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);

  pStepCountCharacteristic = createCharacteristic(STEPCOUNT_CHARACTERISTIC_UUID, pService);
  pHeartRateCharacteristic = createCharacteristic(HEARTRATE_CHARACTERISTIC_UUID, pService);

    //start the service
  pService->start();
  //start advertising service
  BLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  // helps with IPhone pairing
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Ready! For your bits!");
}

void loop() {
  // put your main code here, to run repeatedly:

   // disconnecting
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    Serial.println("start advertising");
    oldDeviceConnected = deviceConnected;
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected) {
    // do stuff here on connecting
    oldDeviceConnected = deviceConnected;
  }

     if(!deviceConnected){
    return;
  }

  int stepCount = random(30);
  String stepData = String(stepCount);
  pStepCountCharacteristic->setValue(stepData.c_str());
  pStepCountCharacteristic->notify();

  Serial.print("Value is: ");
  Serial.println(stepCount);

  heartRate = readValue(pHeartRateCharacteristic);
  Serial.print("heart rate value is: ");
  if (heartRate > 0){
    Serial.println(heartRate);
  }
  else {
    Serial.println("No Heart rate value received");
  }


  delay(500);
}
