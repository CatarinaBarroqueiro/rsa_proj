import paho.mqtt.client as mqtt
import xml.etree.ElementTree as ET

def connect_to_mqtt_broker(broker_address: str, broker_port: int) -> mqtt.Client:
    client = mqtt.Client()
    client.connect(broker_address, broker_port)
    return client

# MQTT broker details
broker_address = "mqtt.example.com"
broker_port = 1883
topic = "gpx_data"

# GPX file path
gpx_file = "/path/to/gpx/file.gpx"

# Create MQTT client
client = mqtt.Client()

# Connect to MQTT broker
client.connect(broker_address, broker_port)

# Read GPX data from file
tree = ET.parse(gpx_file)
root = tree.getroot()

# Extract relevant data from GPX file
# Modify this part according to your specific GPX structure
for trkpt in root.findall(".//{http://www.topografix.com/GPX/1/1}trkpt"):
    lat = trkpt.attrib["lat"]
    lon = trkpt.attrib["lon"]
    ele = trkpt.find("{http://www.topografix.com/GPX/1/1}ele").text

    # Publish data to MQTT broker
    message = f"Latitude: {lat}, Longitude: {lon}, Elevation: {ele}"
    client.publish(topic, message)

# Disconnect from MQTT broker
client.disconnect()