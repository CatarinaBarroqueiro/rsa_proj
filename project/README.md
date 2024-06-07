# Environment

This project was developed in linux, and such is required to use the execution scripts.

# Setup

Make sure docker is installed and start by creating the following network:

```bash
docker network create fleeta-network --subnet 192.168.98.0/24
```

Next, you are able to run the OBU and RSU, using the provided `docker-compose.yml` file:

```bash
sh buildAndRun.sh
```

Lastly, in a new terminal/tab execute the Orchestrator with the following command:

```bash
cd orchestrator
python3 orchestrator.py
```

Note that in using python environments use is strongly advised and if missing the required libraries, installed them using the `requirements.txt` file, using **PIP**.


