FROM debian:bullseye-slim
ENV TZ=Europe/Lisbon

USER root

RUN apt-get update && apt-get upgrade -y 

RUN apt-get install -y python3 python3-pip

WORKDIR /app
ENV EMBEDDED_MOSQUITTO_PORT=1883

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY obu.py obu.py

COPY mock_gpx mock_gpx

COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]