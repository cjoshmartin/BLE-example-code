#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <string>
#include <iostream>

BLEServer *pServer;
#define DEVICE_NAME "MyESP32"
#define SERVICE_UUID "ab49b033-1163-48db-931c-9c2a3002ee1d"

BLECharacteristic *pToggleCharacteristic;
#define TOGGLES_CHARACTERISTIC_UUID "5bc6df48-8953-4fa6-a3a9-639ef83f7fe7"

BLECharacteristic *pAllLotCharacteristic;
#define ALL_LOT_CHARACTERISTIC_UUID "605e066d-809a-44e2-8776-11d31ba100a2"

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

std::string readValue(BLECharacteristic *characteristic, bool isArray) {
    std::string value = std::string(
      (
        characteristic->getValue()
      ).c_str()
    );

    return value;
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

  pToggleCharacteristic = createCharacteristic(TOGGLES_CHARACTERISTIC_UUID, pService);
  pAllLotCharacteristic = createCharacteristic(ALL_LOT_CHARACTERISTIC_UUID, pService);

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

JsonDocument doc;

void printBinary(byte inByte)
{
  for (int b = 7; b >= 0; b--)
  {
    Serial.print(bitRead(inByte, b));
  }
   Serial.println("");
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

  int toggles = readValue(pToggleCharacteristic);
  printBinary((byte)toggles);

  std::string value = readValue(pAllLotCharacteristic, true);
  DeserializationError error = deserializeJson(doc, value);

  // Test if parsing succeeds.
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  int v1 = doc[0];
  int v2 = doc[1];
  int v3 = doc[2];
  int v4 = doc[3];

  Serial.print("JSON Values: [");
  Serial.print(v1);
  Serial.print(",");
  Serial.print(v2);
  Serial.print(",");
  Serial.print(v3);
  Serial.print(",");
  Serial.print(v4);
  Serial.println("]");
  delay(500);
}
