FROM python:3.10
ENV TZ=Europe/Lisbon

USER root

# Update the system and install necessary packages for blocking of packets
RUN apt-get update && apt-get upgrade -y 
RUN apt-get install iputils-ping ebtables iproute2 bridge-utils -y

# Install npm
RUN apt-get install npm -y

# Install node
# Install node version 20 (update the shell)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" \
    && nvm install 20

# Install node version 20 (use CMD to launch a new shell)
#RUN nvm install 20 

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Copy orbit
RUN mkdir ./orbit
WORKDIR /app/orbit
COPY orbit/index.mjs index.mjs
COPY orbit/package.json package.json

# Install the orbitDB application
RUN npm install

WORKDIR /app

# Copy python stuff
COPY src src
COPY mock_gpx mock_gpx

# Copy entrypoint
COPY entrypoint.sh entrypoint.sh
RUN ["chmod", "+x", "./entrypoint.sh"]

# Copy configBridge
COPY configBridge.sh configBridge.sh
RUN ["chmod", "+x", "./configBridge.sh"]

ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]