#!/bin/sh
docker compose down

# Variables
obuImageName="fleeta-obu"
rsuImageName="fleeta-rsu"

# Remove OBU image
docker image rm -f $obuImageName:1.0

# Remove RSU image
# ...