#!/bin/sh
docker compose down

# Variables
obuImageName="Fleeta-OBU"
rsuImageName="Fleeta-RSU"

# Remove OBU image
docker image rm -f $obuImageName:1.0

# Remove RSU image
# ...