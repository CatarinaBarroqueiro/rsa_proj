#!/bin/sh

###############################################################################
## This section is used to configure the network block/unblock functionality ##
###############################################################################
IP_ADDR=$(ip -f inet addr show eth0 | awk '/inet / {print $2}')
GW_ADDR=$(ip r | awk '/default / {print $3}')
BR_ID=br0

printf '#!/bin/sh\nebtables -A INPUT -s $1 -j DROP;' > /bin/block
printf '#!/bin/sh\nebtables -D INPUT -s $1 -j DROP;' > /bin/unblock
chmod +x /bin/block
chmod +x /bin/unblock

###############################################################################
##            This section is used to start the OBU application              ##
###############################################################################

# Export machine IP address
export IP_ADDR

#sleep 10 # Just to give time for the broker to start

echo "Starting OBU_$OBU_ID application"
cd ./src
python3 -u obu.py # Use -u to disable buffering and prints to appear in console
echo "OBU application ended"

