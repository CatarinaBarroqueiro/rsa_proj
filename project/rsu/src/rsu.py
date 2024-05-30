"""
`obu.py` is the main script for the OBU. It represents it's lifecycle.
"""
from asyncio import wait_for
import datetime
import json
import os
from time import sleep
import time
import re, uuid
from MQTT import MQTT
import logging
import requests

def get_mac() -> str:
    """
    Get the MAC address of the OBU
    Returns:
        - The MAC address of the OBU
    """
    return ':'.join(re.findall('..', '%012x' % uuid.getnode()))


def add_hashes_to_orbitdb(hashes: dict[str, str]):
    """
    Add the hashes of the devices to the OrbitDB
    Args:
        - hashes: The dictionary containing the hashes of the devices
    """
    for obuId, hash in hashes.items():
        if obuId == os.environ['RSU_ID']:
            continue

        url = "http://localhost:" + os.environ['PYTHON_NODE_API_PORT'] + "/addHash"
        payload = {
            "id": obuId,
            "hash": hash
        }

        jsonPayload = json.dumps(payload)
        logging.debug("Sending data to orbit: " + jsonPayload)

        headers = { "Content-Type": "application/json"}
    
        # Send the POST request
        response = requests.post(url, data=jsonPayload, headers=headers)

        # Check if the request was successful
        if response.status_code == 200:
            logging.info("Hash POST request was successful!")
        else:
            logging.error(f"Failed to make Hash POST request. Status code: {response.status_code}, Response: {response.json()}")


def lifecycle(mqtt: MQTT, ipAddress: str) -> None:
    """
    The lifecycle of the OBU
    Args:
        - mqtt: The MQTT client
        - gps: The GPS object
        - frequency: The frequency of sending the GPS data
    """  
    # Create greating message
    msg: dict = {
        "type": "GREETING",
        "device": "RSU",
        "id": os.environ['RSU_ID'],
        "status": "active",
        "mac": get_mac(),
        "ip": ipAddress,
        "dbHash": "no_hash"
    }

    # Publish the greeting message to the MQTT broker
    mqtt.publish(mqtt.initTopic, json.dumps(msg))

    # Wait for the order to start the simulation from the controller
    mqtt.wait_for_start()

    # Add the hashes of the devices to the OrbitDB
    add_hashes_to_orbitdb(mqtt.devicesHash)

    # Publish the location data to the MQTT broker
    location: dict = {
        "type": "GPS",
        "latitude": os.environ['RSU_GPS_LATITUDE'],
        "longitude": os.environ['RSU_GPS_LONGITUDE'],
        "elevation": 2.5,
        "timestamp": str(datetime.datetime.now())
    }
    mqtt.publish(mqtt.gpsTopic, json.dumps(location))
    
    
    # do nothing, just to let the OrbitDB program running
    while True:
        sleep(1)
        
        

if __name__ == "__main__":
    # Create logger
    logLevel = getattr(logging, os.environ['LOG_LEVEL'].upper(), None)
    if not isinstance(logLevel, int):
        raise ValueError('Invalid log level: %s' % logLevel)

    logging_format = "[%(levelname)s] %(message)s"
    logging.basicConfig(level = logLevel, format=logging_format)

    logging.info("RSU with ID: %s, has mac address of %s and IP: %s", os.environ['RSU_ID'], get_mac(), os.environ['IP_ADDR'])

    # Create MQTT client
    gpsTopic: str = os.environ['MQTT_GPS_TOPIC'] + "/OBU/" + os.environ['RSU_ID']
    initTopic: str = os.environ['MQTT_INIT_TOPIC'] + "/OBU/" + os.environ['RSU_ID']
    controllerTopic: str = os.environ['MQTT_CONTROLLER_TOPIC']
    mqtt = MQTT(os.environ['MQTT_BROKER_HOST'], os.environ['MQTT_BROKER_PORT'], gpsTopic, initTopic, controllerTopic)
    try:
        logging.info("Connecting to MQTT broker with address: " + os.environ['MQTT_BROKER_HOST'] + " and port: " + os.environ['MQTT_BROKER_PORT'])
        logging.info("Subscribing to topics: " + initTopic + ", " + controllerTopic + ". Publishing to topics: " + gpsTopic + ", " + initTopic)
        mqtt.connect()
    except ConnectionError as e:
        logging.error("Failed to connect to MQTT broker: " + str(e))
        exit(1)
    
    logging.info("Starting RSU lifecycle")
    try:
        mqtt.wait_for_init()
        lifecycle(mqtt, os.environ['IP_ADDR'])
    except ConnectionError as e:
        logging.error("Failed to publish GPS data: " + str(e))
    except KeyboardInterrupt:
        logging.info("OBU lifecycle interrupted")
    except Exception as e:
        logging.error("An error occurred: " + str(e))
    
    logging.info("RSU lifecycle complete")