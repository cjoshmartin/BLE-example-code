#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

BLEServer *pServer;
#define DEVICE_NAME "MyESP32"
#define SERVICE_UUID "ab49b033-1163-48db-931c-9c2a3002ee1d"

BLECharacteristic *pStepCountCharacteristic;
#define STEPCOUNT_CHARACTERISTIC_UUID "fbb6411e-26a7-44fb-b7a3-a343e2b011fe"

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
    }
    
    void onConnect(BLEServer* pServer) {
      }

    void onDisconnect(BLEServer* pServer){
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
  BLEService *pService = pServer->createService(SERVICE_UUID);

  pStepCountCharacteristic = createCharacteristic(STEPCOUNT_CHARACTERISTIC_UUID, pService);

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
  int stepCount = random(30);
  String stepData = String(stepCount);
  pStepCountCharacteristic->setValue(stepData.c_str());
  pStepCountCharacteristic->notify();

  Serial.print("Value is: ");
  Serial.println(stepCount);
  delay(500);
}
