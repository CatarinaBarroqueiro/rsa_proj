import logging
import os
import configparser
import paho.mqtt.client as mqtt


if __name__ == "__main__":
    # Create a new configuration object
    config = configparser.ConfigParser()

    # Read the configuration from the file
    config.read('config.ini')

    # MQTT Configurations
    MQTT_BROKER_HOST = config['MQTT_Settings']['MQTT_BROKER_HOST']
    MQTT_BROKER_PORT = config['MQTT_Settings']['MQTT_BROKER_PORT']
    GPS_TOPIC = config['MQTT_Settings']['gps-location/OBU/+']

    # Create logger
    logLevel = getattr(logging, os.environ['LOG_LEVEL'].upper(), None)
    if not isinstance(logLevel, int):
        raise ValueError('Invalid log level: %s' % logLevel)

    logging_format = "[%(levelname)s] %(message)s"
    logging.basicConfig(level = logLevel, format=logging_format)

    logging.info("OBU with ID: %s, has mac address of %s and IP: %s", os.environ['OBU_ID'], get_mac(), os.environ['IP_ADDR'])