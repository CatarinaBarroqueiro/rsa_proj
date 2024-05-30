"""
`obu.py` is the main script for the OBU. It represents it's lifecycle.
"""
from asyncio import wait_for
import json
import os
from time import sleep
import time
import re, uuid
from GPS import GPS, Location
from MQTT import MQTT
from Event import Event, EVENTS
import logging

myDbHash = "abcd"

def get_mac() -> str:
    """
    Get the MAC address of the OBU
    Returns:
        - The MAC address of the OBU
    """
    return ':'.join(re.findall('..', '%012x' % uuid.getnode()))


def lifecycle(mqtt: MQTT, gps: GPS, frequency: int, ipAddress: str, eventHandler: Event) -> None:
    """
    The lifecycle of the OBU
    Args:
        - mqtt: The MQTT client
        - gps: The GPS object
        - frequency: The frequency of sending the GPS data
    """ 
    # Wait for OrbitDB to create the hash of our database
    logging.info("Waiting for OrbitDB to create the database: ")
    fileName: str = "./../orbit/storage/hash/" + os.environ['OBU_ID'] + "/hash.txt"
    while not os.path.exists(fileName):
        sleep(1)
        print(".", end="", flush=True)

    with open(fileName, "r") as file:
        myDbHash = file.read()

    # Create greating message
    msg: dict = {
        "type": "GREETING",
        "device": "OBU",
        "id": os.environ['OBU_ID'],
        "status": "active",
        "mac": get_mac(),
        "ip": ipAddress,
        "dbHash": myDbHash
    }

    # Publish the greeting message to the MQTT broker
    mqtt.publish(mqtt.initTopic, json.dumps(msg))

    # Wait for the order to start the simulation from the controller
    mqtt.wait_for_start()

    # Publish the location data to the MQTT broker
    while True:
        location = gps.get_location()
        if(location == None):
            logging.info("End of GPX file")
            break

        mqtt.publish(mqtt.gpsTopic, location.json_to_str())
        event = eventHandler.get_event()
        if(event == None):
            logging.info("No event generated")
        else:
            logging.info("Event generated: " + event.value)
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
    gpsTopic: str = os.environ['MQTT_GPS_TOPIC'] + "/OBU/" + os.environ['OBU_ID']
    initTopic: str = os.environ['MQTT_INIT_TOPIC'] + "/OBU/" + os.environ['OBU_ID']
    controllerTopic: str = os.environ['MQTT_CONTROLLER_TOPIC']
    mqtt = MQTT(os.environ['MQTT_BROKER_HOST'], os.environ['MQTT_BROKER_PORT'], gpsTopic, initTopic, controllerTopic)
    try:
        logging.info("Connecting to MQTT broker with address: " + os.environ['MQTT_BROKER_HOST'] + " and port: " + os.environ['MQTT_BROKER_PORT'])
        logging.info("Subscribing to topics: " + initTopic + ", " + controllerTopic + ". Publishing to topics: " + gpsTopic + ", " + initTopic)
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
        mqtt.wait_for_init()
        lifecycle(mqtt, gps, int(os.environ['GPS_MOCK_SPEED']), os.environ['IP_ADDR'], Event(int(os.environ['EVENT_PROBABILITY'])))
    except ConnectionError as e:
        logging.error("Failed to publish GPS data: " + str(e))
    except KeyboardInterrupt:
        logging.info("OBU lifecycle interrupted")
    except Exception as e:
        logging.error("An error occurred: " + str(e))
    
    logging.info("OBU lifecycle complete")