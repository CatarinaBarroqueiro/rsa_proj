#!/bin/sh

# Start the Multiverse peer node
multi daemon &

# Wait for the daemon to start up
sleep 5

# Wait for the remote path file to be available
while [ ! -f /shared-data/remote_path.txt ]; do
  sleep 1
done

# Read the remote path from the file
REMOTE_PATH=$(cat /shared-data/remote_path.txt)

# Initialize a new repository and link to the remote repository
mkdir -p /fleeta-vehicles-data
cd /fleeta-vehicles-data
multi init
multi remote create origin $REMOTE_PATH
multi branch set remote origin

# Keep the container running
tail -f /dev/null
