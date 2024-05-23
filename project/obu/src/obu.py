"""
`obu.py` is the main script for the OBU. It represents it's lifecycle.
"""
import json
import os
from time import sleep
import time
import re, uuid
from GPS import GPS, Location
from MQTT import MQTT
import logging


def get_mac() -> str:
    """
    Get the MAC address of the OBU
    Returns:
        - The MAC address of the OBU
    """
    return ':'.join(re.findall('..', '%012x' % uuid.getnode()))


def lifecycle(mqtt: MQTT, gps: GPS, frequency: int, ipAddress: str) -> None:
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
        "device": "OBU",
        "id": os.environ['OBU_ID'],
        "status": "active",
        "mac": get_mac(),
        "ip": ipAddress
    }

    # Publish the greeting message to the MQTT broker
    mqtt.publish(json.dumps(msg))

    # Publish the location data to the MQTT broker
    while True:
        location = gps.get_location()
        mqtt.publish(location.json_to_str())
        sleep(frequency)

if __name__ == "__main__":
    # Create logger
    logLevel = getattr(logging, os.environ['LOG_LEVEL'].upper(), None)
    if not isinstance(logLevel, int):
        raise ValueError('Invalid log level: %s' % logLevel)

    logging_format = "[%(levelname)s] %(message)s"
    logging.basicConfig(level = logLevel, format=logging_format)

    logging.info("OBU with ID: %s, has mac address of %s and IP: %s", os.environ['OBU_ID'], get_mac(), os.environ['IP_ADDR'])

    # Create MQTT client
    topic: str = os.environ['MQTT_GPS_TOPIC'] + "/OBU/" + os.environ['OBU_ID']
    mqtt = MQTT(os.environ['MQTT_BROKER_HOST'], os.environ['MQTT_BROKER_PORT'], topic)
    try:
        logging.info("Connecting to MQTT broker with address: " + os.environ['MQTT_BROKER_HOST'] + " and port: " + os.environ['MQTT_BROKER_PORT'] + " and topic: " + topic)
        mqtt.connect()
    except ConnectionError as e:
        logging.error("Failed to connect to MQTT broker: " + str(e))
        exit(1)

    # Create GPS object
    try:
        logging.info("Reading GPX file: " + os.environ['GPX_FILE_PATH'])
        gps = GPS(os.environ['GPX_FILE_PATH'])
    except FileNotFoundError as e:
        logging.error("Failed to read GPX file: " + str(e))
        exit(1)
    
    logging.info("Starting OBU lifecycle")
    try:
        lifecycle(mqtt, gps, int(os.environ['GPS_MOCK_SPEED']), os.environ['IP_ADDR'])
    except ConnectionError as e:
        logging.error("Failed to publish GPS data: " + str(e))
    except KeyboardInterrupt:
        logging.info("OBU lifecycle interrupted")
    except Exception as e:
        logging.error("An error occurred: " + str(e))
    
    logging.info("OBU lifecycle complete")