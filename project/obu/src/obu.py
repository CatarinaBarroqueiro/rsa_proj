import json
import os
from time import sleep
import re, uuid
from GPS import GPS, Location
from MQTT import MQTT

def get_mac() -> str:
    """
    Get the MAC address of the OBU
    Returns:
        - The MAC address of the OBU
    """
    return ':'.join(re.findall('..', '%012x' % uuid.getnode()))


def lifecycle(mqtt: MQTT, gps: GPS, frequency: int) -> None:
    """
    The lifecycle of the OBU
    Args:
        - mqtt: The MQTT client
        - gps: The GPS object
        - frequency: The frequency of sending the GPS data
    """  
    # Create greating message
    msg: dict = {
        "type": "OBU",
        "id": os.environ['OBU_ID'],
        "status": "active",
        "mac": get_mac()
    }

    # Publish the greeting message to the MQTT broker
    print(f"Publishing greeting message: {msg}")
    mqtt.publish(json.dumps(msg))


    # Publish the location data to the MQTT broker
    while True:
        location = gps.get_location()
        print(f"Publishing location: {location}")
        mqtt.publish(location.json_to_str())
        sleep(frequency)

if __name__ == "__main__":
    # Create MQTT client
    topic: str = os.environ['MQTT_GPS_TOPIC'] + "/" + os.environ['OBU_ID']
    mqtt = MQTT(os.environ['MQTT_BROKER_HOST'], os.environ['MQTT_BROKER_PORT'], topic)
    try:
        print("Connecting to MQTT broker with address: " + os.environ['MQTT_BROKER_HOST'] + " and port: " + os.environ['MQTT_BROKER_PORT'] + " and topic: " + topic)
        mqtt.connect()
    except ConnectionError as e:
        print("Failed to connect to MQTT broker: " + str(e))
        exit(1)

    # Create GPS object
    try:
        print("Reading GPX file: " + os.environ['GPX_FILE_PATH'])
        gps = GPS(os.environ['GPX_FILE_PATH'])
    except FileNotFoundError as e:
        print("Failed to read GPX file: " + str(e))
        exit(1)
    
    print("Starting OBU lifecycle")
    try:
        lifecycle(mqtt, gps, int(os.environ['GPS_MOCK_SPEED']))
    except ConnectionError as e:
        print("Failed to publish GPS data: " + str(e))
    except KeyboardInterrupt:
        print("OBU lifecycle interrupted")
    except Exception as e:
        print("An error occurred: " + str(e))
    
    print("OBU lifecycle complete")