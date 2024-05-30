FROM python:3.10
ENV TZ=Europe/Lisbon

USER root

# Update the system and install necessary packages for blocking of packets
RUN apt-get update && apt-get upgrade -y 
RUN apt-get install iputils-ping ebtables iproute2 bridge-utils -y

# Install npm
RUN apt-get install npm -y

# Install nvm and node version 20
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" \
    && nvm install 20 \
    && nvm use 20 \
    && nvm alias default 20

# Set up environment variables for nvm
ENV NVM_DIR="/root/.nvm"
ENV NODE_VERSION="20"
RUN echo 'export NVM_DIR="/root/.nvm"' >> /root/.bashrc
RUN echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /root/.bashrc
RUN echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> /root/.bashrc
RUN echo 'nvm use $NODE_VERSION' >> /root/.bashrc

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Copy orbit
RUN mkdir ./orbit
WORKDIR /app/orbit
COPY orbit/package.json package.json
# Use this npm install to cache installation packages
RUN npm install

COPY orbit/index.mjs index.mjs

# Install the orbitDB application
RUN npm install

WORKDIR /app

# Copy python stuff
COPY src src

# Copy entrypoint
COPY entrypoint.sh entrypoint.sh
RUN ["chmod", "+x", "./entrypoint.sh"]

# Copy configBridge
COPY configBridge.sh configBridge.sh
RUN ["chmod", "+x", "./configBridge.sh"]

ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]