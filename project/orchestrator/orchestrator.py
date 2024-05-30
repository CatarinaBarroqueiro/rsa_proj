"""
`orchestrator.py` is the main file that is responsible for the managing connections between the OBU's and RSU
"""
from calendar import c
import logging
import json
from turtle import back
import requests
import os
import configparser
from time import sleep
from xmlrpc.client import Boolean
from packages.MQTT import MQTT
from packages.Device import Device
from packages.Location import Location

# Global variables
connectedDevices: list[list] = []

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

    connectedDevices.append([device1.deviceID, device2.deviceID])
    logging.info("Devices " + str(device1.deviceID) + " and " + str(device2.deviceID) + " are connected")
    if device1.mac not in device2.blockedMac or device2.mac not in device1.blockedMac:
        return
    
    device1.unblock_device(device2.mac)
    device2.unblock_device(device1.mac)


def block_devices(mqtt: MQTT, device1: Device, device2: Device) -> None:
    """
    Block two devices
    Args:
        - mqtt: The MQTT client
        - device1: The first device
        - device2: The second device
    """
    logging.info("Devices " + str(device1.deviceID) + " and " + str(device2.deviceID) + " are blocked")
    if device1.mac in device2.blockedMac or device2.mac in device1.blockedMac:
        return
    
    if connectedDevices.count([device1.deviceID, device2.deviceID]) > 0:
        connectedDevices.remove([device1.deviceID, device2.deviceID])

    device1.block_device(device2.mac)
    device2.block_device(device1.mac)


def send_to_backend(mqtt: MQTT, backendURL: str) -> bool:
    """
    Send the data to the dashboard backend
    Args:
        - mqtt: The MQTT client
        - backendURL: The URL of the backend
    Returns:
        - bool: True if the data was sent successfully, False otherwise
    """
    payload: dict = {}

    # Add OBU's
    obus: list[dict] = []
    for key, value in mqtt.locations.items():
        obus.append({
            "obu": key,
            "location": {
                "latitude": value.latitude,
                "longitude": value.longitude
            },
        })
    payload["obus"] = obus

    # Add Connectivity
    connectivity: list[dict] = []
    for value in connectedDevices:
        connectivity.append({
            "pair": {
                "obu1": value[0],
                "obu2": value[1]
            }
        })

    # Convert the data to JSON format
    jsonPayload = json.dumps(payload)

    # Headers (optional, but often required for APIs expecting JSON data)
    headers = {
        "Content-Type": "application/json",
    }
    
    logging.info("Sending data to backend: " + jsonPayload)

    # Send the POST request
    response = requests.post(BACKEND_URL, data=jsonPayload, headers=headers)

    # Check if the request was successful
    if response.status_code == 200:
        logging.info("POST request was successful!")
    else:
        logging.error(f"Failed to make POST request. Status code: {response.status_code}")

    

def lifecycle(mqtt: MQTT, backendURL: str) -> None:
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

        # Update real-time dashboard
        send_to_backend(mqtt, backendURL)

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
    INIT_TOPIC = config['MQTT_Settings']['INIT_TOPIC']
    CONTROLLER_TOPIC = config['MQTT_Settings']['CONTROLLER_TOPIC']

    # General Configurations
    LOG_LEVEL = config['Settings']['LOG_LEVEL']
    BACKEND_URL = config['Settings']['BACKEND_URL']
    OBUS_NUMBER = int(config['Settings']['OBUS_NUMBER'])

    # Create logger
    logLevel = getattr(logging, LOG_LEVEL.upper(), None)
    if not isinstance(logLevel, int):
        raise ValueError('Invalid log level: %s' % logLevel)

    logging_format = "[%(levelname)s] %(message)s"
    logging.basicConfig(level = logLevel, format=logging_format)

    # Create MQTT client
    mqtt = MQTT(MQTT_BROKER_HOST, MQTT_BROKER_PORT, GPS_TOPIC, INIT_TOPIC, CONTROLLER_TOPIC, OBUS_NUMBER)
    try:
        logging.info("Connecting to MQTT broker with address: " + MQTT_BROKER_HOST + " and port: " + MQTT_BROKER_PORT)
        logging.info("Subscribing to topics: " + GPS_TOPIC + ", " + INIT_TOPIC + ". Publishing to: " + CONTROLLER_TOPIC)
        mqtt.connect()
    except ConnectionError as e:
        logging.error("Failed to connect to MQTT broker: " + str(e))
        exit(1)

    logging.info("Starting Orchestrator lifecycle")
    try:
        mqtt.publish(json.dumps({"order": "init"}))
        mqtt.wait_all_ready()
        mqtt.publish(json.dumps({"order": "start"}))
        lifecycle(mqtt, BACKEND_URL)
    except KeyboardInterrupt:
        logging.info("Orchestrator lifecycle interrupted")
    #except Exception as e:
    #    logging.error("An error occurred: " + str(e))
    
    logging.info("Orchestrator lifecycle complete")

    