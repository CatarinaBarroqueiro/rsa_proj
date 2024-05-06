# Manifest of the Orchestrator


# Approches

* All containers are in the same network and connected, with the Orchestrator having the option to access other containers individually and block/enable connections
* All containers connected to the Orchestrator, but can't communicate with each other. When OBUs start approaching each other, the Orchestrator adds them to the same network or manually allows them to communicate in the current network