#!/bin/sh

# Print a message to indicate that the script is running
echo "Running entrypoint-peer1.sh script..."

# Start the Multiverse peer node
multi daemon &

# Wait for the daemon to start up
sleep 5

# Initialize a new repository
mkdir -p /fleeta-vehicles-data
cd /fleeta-vehicles-data
multi init

# Create a new remote repository with the name fleeta-vehicles-data and save the remote path
REMOTE_PATH=$(multi repo create fleeta-vehicles-data | grep -oE '12D3Koo.*')
echo $REMOTE_PATH > /shared-data/remote_path.txt

# Add the remote to the repository
multi remote create origin $REMOTE_PATH

# Set the branch remote
multi branch set remote origin

# Keep the container running
tail -f /dev/null
