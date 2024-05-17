#!/bin/sh
docker compose down

# Variables
obuImageName="fleeta-obu"
rsuImageName="fleeta-rsu"

# Build OBU image
cd obu
docker build -t $obuImageName:1.0 .
if [ $? -ne 0 ]; then
    echo "Error occurred while building the OBU container $obuImageName image"
    exit 1
fi

# Build RSU image
# ...

# Run the containers
cd ..
docker-compose up # -d --remove-orphans