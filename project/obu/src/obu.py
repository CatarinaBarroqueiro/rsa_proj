import os
import paho.mqtt.client as mqtt

def connect_to_mqtt_broker(broker_address: str, broker_port: int) -> mqtt.Client:
    client = mqtt.Client()
    client.connect(broker_address, broker_port)
    return client

# MQTT broker details
broker_address = "mqtt.example.com"
broker_port = 1883
topic = "gpx_data"

# print the current timestamp
# print the current timestamp
import datetime
print(datetime.datetime.now())


# GPX file path
gpx_file = "/path/to/gpx/file.gpx"

# Create MQTT client
client = mqtt.Client()

# Connect to MQTT broker
client.connect(os.environ['MQTT_BROKER_HOST'], os.environ['MQTT_BROKER_PORT'])

# Read GPX data from file
tree = ET.parse(os.environ['MQTT_GPS_TOPIC'])
root = tree.getroot()

# Extract relevant data from GPX file
# Modify this part according to your specific GPX structure
for trkpt in root.findall(".//{http://www.topografix.com/GPX/1/1}trkpt"):
    lat = trkpt.attrib["lat"]
    lon = trkpt.attrib["lon"]
    ele = trkpt.find("{http://www.topografix.com/GPX/1/1}ele").text

    # Publish data to MQTT broker
    message = f"Latitude: {lat}, Longitude: {lon}, Elevation: {ele}"
    client.publish(os.environ['MQTT_GPS_TOPIC'], message)

# Disconnect from MQTT broker
client.disconnect()