FROM python:3.10
ENV TZ=Europe/Lisbon

USER root

RUN apt-get update && apt-get upgrade -y 

RUN apt-get install iputils-ping ebtables iproute2 bridge-utils -y

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY src src

COPY mock_gpx mock_gpx

COPY entrypoint.sh entrypoint.sh

RUN ["chmod", "+x", "./entrypoint.sh"]

COPY configBridge.sh configBridge.sh

RUN ["chmod", "+x", "./configBridge.sh"]

ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]
#ENTRYPOINT ["./entrypoint.sh"]