"""
`MQTT` package is used to communicate with the MQTT broker, by publishing the OBU gps data
"""
import codecs
import json
import logging
from time import sleep
import paho.mqtt.client as mqtt

class MQTT:
    """
    Class `MQTT` handles connection to the MQTT broker.
    Attributes:
        - brokerHostName: The hostname of the MQTT broker
        - brokerPort: The port number of the MQTT broker
        - gpsTopic: The topic for the gps data
        - initTopic: The topic for the hash data
        - controllerTopic: The topic for the controller data
        - client: The MQTT client
        - devicesHash: The dictionary of devices
        - initStatus: Order to send the initialization message, given by the controller
        - startStatus: Order to start the OBU, given by the controller
    """
    def __init__(self, brokerHostName: str, brokerHostPort: str, gpsTopic: str, initTopic: str, controllerTopic: str) -> None:
        """
        Initialize the class
        Args:
            - brokerHostName: The hostname of the MQTT broker
            - brokerHostPort: The port number of the MQTT broker
            - gpsTopic: The topic for the gps data
            - initTopic: The topic for the hash data
            - controllerTopic: The topic for the controller data
        Raises:
            - ValueError: If the port number is not an integer
        """
        self.brokerHostName: str = brokerHostName
        self.brokerHostPort: int = int(brokerHostPort)
        self.gpsTopic: str = gpsTopic
        self.initTopic: str = initTopic
        self.controllerTopic: str = controllerTopic
        self.client: mqtt.ClientClient | None = None
        self.devicesHash: dict[str, str] = {}  # Device ID -> Hash
        self.initStatus: bool = False
        self.startStatus: bool = False

    def connect(self) -> None:
        """
        Connect to the MQTT broker
        Raises:
            - ConnectionError: If the connection to the MQTT broker fails
        """
        self.client: mqtt.ClientClient = mqtt.Client()
        self.client.connect(self.brokerHostName, self.brokerHostPort)
        self.client.on_message = self._on_message
        self.client.loop_start()
        
        # Remove the last / and add + to subscribe to all topics
        parts = self.initTopic.split("/")
        # Modify the last element
        parts[-1] = "+"
        # Join the modified parts back with '/'
        allInitTopics: str = "/".join(parts)
        
        self.client.subscribe(allInitTopics)
        self.client.subscribe(self.controllerTopic)

    def publish(self, topic: str, message: str) -> None:
        """
        Publish the message to the MQTT broker
        Args:
            - topic: The topic to publish to
            - message: The message to publish
        Raises:
            - ConnectionError: If the connection to the MQTT broker fails
        """
        logging.debug("Publishing to MQTT: " + message + " to topic: " + topic)
        self.client.publish(topic, message)

    def disconnect(self) -> None:
        """
        Disconnect from the MQTT broker
        """
        self.client.disconnect()

    def wait_for_init(self) -> None:
        """
        Wait for the initialization message
        """
        while not self.initStatus:
            sleep(1)

    def wait_for_start(self) -> None:
        """
        Wait for the start message
        """
        while not self.startStatus:
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
        
        try:
            # message.payload is in byte format, so need to convert to string first
            messageStr: str = codecs.decode(message.payload, "utf-8")
            payload: dict = json.loads(messageStr)
        except json.JSONDecodeError as e:
            logging.error("Error parsing the message: " + str(e))
            return
        
        if message.topic == self.controllerTopic:
            if "order" in payload and payload["order"] == "init":
                self.initStatus = True

            elif "order" in payload and payload["order"] == "start":
                self.startStatus = True

            else:
                logging.error("Invalid message received")

        elif "type" in payload and payload["type"] == "GREETING":
            if "device" in payload and payload["device"] != "OBU":
                logging.debug("Received message from RSU")
                return
                        
            if "id" in payload and "dbHash" in payload:
                self.devicesHash[payload["id"]] = payload["dbHash"]
            else:
                logging.error("Invalid message received")
        