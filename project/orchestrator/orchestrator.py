"""
`orchestrator.py` is the main file that is responsible for the managing connections between the OBU's and RSU
"""
import logging
import os
import configparser
from time import sleep
from packages.MQTT import MQTT
from packages.Device import Device
from packages.Location import Location

#connectedDevices: list[list] = []

def join_devices(mqtt: MQTT, device1: Device, device2: Device) -> None:
    """
    Join two devices
    Args:
        - mqtt: The MQTT client
        - device1: The first device
        - device2: The second device
    """
    #if [device1.deviceID, device2.deviceID] in connectedDevices:
    #    return

    #connectedDevices.append([device1.deviceID, device2.deviceID])
    device1.unblock_device(device2.mac)
    device2.unblock_device(device1.mac)
    logging.info("Devices " + str(device1.deviceID) + " and " + str(device2.deviceID) + " are connected")


def block_devices(mqtt: MQTT, device1: Device, device2: Device) -> None:
    """
    Block two devices
    Args:
        - mqtt: The MQTT client
        - device1: The first device
        - device2: The second device
    """
    device1.block_device(device2.mac)
    device2.block_device(device1.mac)
    logging.info("Devices " + str(device1.deviceID) + " and " + str(device2.deviceID) + " are blocked")


def lifecycle(mqtt: MQTT) -> None:
    """
    The lifecycle of the Orchestrator
    Args:
        - mqtt: The MQTT client
    """  
    while True:
        for key, value in mqtt.locations.items():
            for compKey, compValue in mqtt.locations.items():
                if key == compKey:
                    continue

                if Location.locations_close(value, compValue):
                    join_devices(mqtt, mqtt.devices[key], mqtt.devices[compKey])
                else:
                    block_devices(mqtt, mqtt.devices[key], mqtt.devices[compKey])

        # Sleep for 5 seconds
        sleep(5)

if __name__ == "__main__":
    # Create a new configuration object
    config = configparser.ConfigParser()

    # Read the configuration from the file
    config.read('config.ini')

    # MQTT Configurations
    MQTT_BROKER_HOST = config['MQTT_Settings']['MQTT_BROKER_HOST']
    MQTT_BROKER_PORT = config['MQTT_Settings']['MQTT_BROKER_PORT']
    GPS_TOPIC = config['MQTT_Settings']['GPS_TOPIC']

    # General Configurations
    LOG_LEVEL = config['Settings']['LOG_LEVEL']

    # Create logger
    logLevel = getattr(logging, LOG_LEVEL.upper(), None)
    if not isinstance(logLevel, int):
        raise ValueError('Invalid log level: %s' % logLevel)

    logging_format = "[%(levelname)s] %(message)s"
    logging.basicConfig(level = logLevel, format=logging_format)

    # Create MQTT client
    mqtt = MQTT(MQTT_BROKER_HOST, MQTT_BROKER_PORT, GPS_TOPIC)
    try:
        logging.info("Connecting to MQTT broker with address: " + MQTT_BROKER_HOST + " and port: " + MQTT_BROKER_PORT + " and topic: " + GPS_TOPIC)
        mqtt.connect()
    except ConnectionError as e:
        logging.error("Failed to connect to MQTT broker: " + str(e))
        exit(1)

    logging.info("Starting Orchestrator lifecycle")
    try:
        lifecycle(mqtt)
    except KeyboardInterrupt:
        logging.info("Orchestrator lifecycle interrupted")
    #except Exception as e:
    #    logging.error("An error occurred: " + str(e))
    
    logging.info("Orchestrator lifecycle complete")

    