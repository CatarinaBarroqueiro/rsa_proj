"""
`MQTT` package is used to communicate with the MQTT broker, by publishing the OBU gps data
"""
import logging
import paho.mqtt.client as mqtt

class MQTT:
    """
    Class `MQTT` handles connection to the MQTT broker.
    Attributes:
        - brokerHostName: The hostname of the MQTT broker
        - brokerPort: The port number of the MQTT broker
        - topic: The topic to publish the data
        - client: The MQTT client
    """
    def __init__(self, brokerHostName: str, brokerHostPort: str, topic: str) -> None:
        """
        Initialize the class
        Args:
            - brokerHostName: The hostname of the MQTT broker
            - brokerHostPort: The port number of the MQTT broker
            - topic: The topic to publish the data
        Raises:
            - ValueError: If the port number is not an integer
        """
        self.brokerHostName: str = brokerHostName
        self.brokerHostPort: int = int(brokerHostPort)
        self.topic: str = topic
        self.client: mqtt.ClientClient | None = None

    def connect(self) -> None:
        """
        Connect to the MQTT broker
        Raises:
            - ConnectionError: If the connection to the MQTT broker fails
        """
        self.client: mqtt.ClientClient = mqtt.Client()
        self.client.connect(self.brokerHostName, self.brokerHostPort)

    def publish(self, message: str) -> None:
        """
        Publish the message to the MQTT broker
        Args:
            - message: The message to publish
        Raises:
            - ConnectionError: If the connection to the MQTT broker fails
        """
        logging.debug("Publishing to MQTT: " + message + " to topic: " + self.topic)
        self.client.publish(self.topic, message)

    def disconnect(self) -> None:
        """
        Disconnect from the MQTT broker
        """
        self.client.disconnect()
        

        