FROM python:latest
ENV TZ=Europe/Lisbon

WORKDIR /app
ENV EMBEDDED_MOSQUITTO_PORT=1883

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY obu.py obu.py

COPY entrypoint.sh entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]