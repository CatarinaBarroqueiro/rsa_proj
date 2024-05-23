#!/bin/sh

# Start the Multiverse peer node
multi daemon &

# Wait for the daemon to start up
sleep 5

# Initialize a new repository
mkdir -p /fleeta-vehicles-data
cd /fleeta-vehicles-data
multi init

# Create a new remote repository
REMOTE_PATH=$(multi repo create fleeta-vehicles-data | tail -n 1)

# Add the remote to the repository
multi remote create origin $REMOTE_PATH

# Set the branch remote
multi branch set remote origin

# Keep the container running
tail -f /dev/null
