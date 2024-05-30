"""
`MQTT` package is used to communicate with the MQTT broker, by publishing the the OBU gps data
"""
import logging
import json
import codecs
from time import sleep
import paho.mqtt.client as mqtt
import datetime
from threading import Lock, Timer
from packages.Location import Location
from packages.Device import Device
from packages.Utils import check_dict_fields

class MQTT:
    """
    Class `MQTT` handles connection to the MQTT broker.
    Attributes:
        - brokerHostName: The hostname of the MQTT broker
        - brokerPort: The port number of the MQTT broker
        - gasTopic: The topic for the gas data
        - initTopic: The topic for the hash data
        - controllerTopic: The topic for the controller data
        - obusNumber: The number of OBU's
        - client: The MQTT client
        - obuLocations: The dictionary of OBU locations
        - devices: The dictionary of devices
    """
    def __init__(self, brokerHostName: str, brokerHostPort: str, gasTopic: str, initTopic: str, controllerTopic: str, obusNumber: int) -> None:
        """
        Initialize the class
        Args:
            - brokerHostName: The hostname of the MQTT broker
            - brokerHostPort: The port number of the MQTT broker
            - gasTopic: The topic for the gas data
            - initTopic: The topic for the hash data
            - controllerTopic: The topic for the controller data
            - obusNumber: The number of OBU's
        Raises:
            - ValueError: If the port number is not an integer
        """
        self.brokerHostName: str = brokerHostName
        self.brokerHostPort: int = int(brokerHostPort)
        self.gasTopic: str = gasTopic
        self.initTopic: str = initTopic
        self.controllerTopic: str = controllerTopic
        self.obusNumber: int = obusNumber
        self.client: mqtt.ClientClient | None = None
        self.locations: dict[int, Location] = {}  # Device ID -> Location
        self.devices: dict[int, Device] = {}  # Device ID -> Device


    def connect(self) -> None:
        """
        Connect to the MQTT broker
        Raises:
            - ConnectionError: If the connection to the MQTT broker fails
        """
        self.client: mqtt.ClientClient = mqtt.Client()
        self.client.connect(self.brokerHostName, self.brokerHostPort)
        self.client.on_message = self._on_message
        self.client.on_connect = self.on_connect
        # Repeatly call the loop() in a thread, until disconnect() is called
        self.client.loop_start()
        self.client.subscribe(self.gasTopic)
        self.client.subscribe(self.initTopic)


    def publish(self, message: str) -> None:
        """
        Publish the message to the MQTT broker
        Args:
            - message: The message to publish
        Raises:
            - ConnectionError: If the connection to the MQTT broker fails
        """
        logging.debug("Publishing to MQTT: " + message + " to topic: " + self.controllerTopic)
        self.client.publish(self.controllerTopic, message)


    def disconnect(self) -> None:
        """
        Disconnect from the MQTT broker
        """
        logging.debug("Disconnecting from MQTT broker")
        self.client.disconnect()


    def on_connect(client, userdata, flags, reason_code, properties) -> None:
        """
        Callback function when the client connects to the broker
        Args:
            - client: The client that connected
            - userdata: The user data
            - flags: The flags
            - reason_code: The reason code
            - properties: The properties
        """
        logging.debug("Connected to MQTT broker")
        #self.client.subscribe(self.topic)

    def wait_all_ready(self) -> None:
        """
        Wait for all the devices to be ready
        """
        while len(self.devices) < self.obusNumber:
            logging.debug("Waiting for all devices to be ready")
            sleep(1)


    def _on_message(self, client, userdata, message) -> None:
        """
        Callback function when a message is received
        Args:
            - client: The client that received the message
            - userdata: The user data
            - message: The message received
        """
        logging.debug("Received message: " + str(message.payload) + " on topic: " + message.topic)

        # Convert message payload to dictionary
        try:
            # message.payload is in byte format, so need to convert to string first
            messageStr: str = codecs.decode(message.payload, "utf-8")
            payload: dict = json.loads(messageStr)
        except json.JSONDecodeError as e:
            logging.error("Error parsing the message: " + str(e))
            return
                
        # Get the OBU ID from the topic
        try:
            devId: str = int(message.topic.split('/')[-1])
        except ValueError as e:
            logging.error("Error parsing the OBU ID: " + str(e))
            return
        
        # Check if the message has the required fields
        if not check_dict_fields(payload, ['type']) or (payload['type'] != 'GPS' and payload['type'] != 'GREETING'):
            logging.error("Received a message without/invalid message type")
            return

        # Process a GREETING/init message
        if payload['type'] == 'GREETING':
            if not check_dict_fields(payload, ['device', 'id', 'status', 'mac', 'ip']):
                logging.error("Received a greeting message without the required fields")
                return
            device: Device = Device(
                                    payload['device'], 
                                    payload['id'], 
                                    payload['status'], 
                                    payload['mac'], 
                                    payload['ip'],
                                    payload['dbHash']
                                    )
            device.configure_device()
            self.devices[devId] = device
            logging.debug("Received GREETING message from OBU: " + str(devId) + " with device: " + str(device))
            
            
        # Process a GPS message
        elif payload['type'] == 'GPS':
            if not check_dict_fields(payload, ['latitude', 'longitude', 'elevation', 'timestamp']):
                logging.error("Received a gps message without the required fields")
                return
            
            location: Location = Location(
                                        payload['latitude'], 
                                        payload['longitude'], 
                                        payload['elevation'], 
                                        datetime.datetime.fromisoformat(payload['timestamp'])
                                        )

            # Check if the OBU is already in the dictionary
            if devId in self.devices.keys():
                # Update the location
                self.locations[devId] = location
                logging.debug("Received GPS message from OBU: " + str(devId) + " with location: " + str(location))
            else:
                logging.error("Received a GPS message from an unknown OBU")
        


        

        