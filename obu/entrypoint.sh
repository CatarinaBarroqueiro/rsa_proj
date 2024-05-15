IP_ADDR=$(ip -f inet addr show eth0 | awk '/inet / {print $2}')
GW_ADDR=$(ip r | awk '/default / {print $3}')
BR_ID=br0

brctl addbr $BR_ID
ip a a $IP_ADDR dev $BR_ID
ip a d  $IP_ADDR dev eth0
brctl addif $BR_ID eth0
ip link set $BR_ID up
ip r a default via $GW_ADDR

printf '#!/bin/sh\nebtables -A INPUT -s $1 -j DROP;' > /bin/block
printf '#!/bin/sh\nebtables -D INPUT -s $1 -j DROP;' > /bin/unblock
chmod +x /bin/block
chmod +x /bin/unblock

