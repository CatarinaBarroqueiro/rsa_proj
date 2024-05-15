FROM debian:bullseye-slim
ENV TZ=Europe/Lisbon

WORKDIR /app
ENV EMBEDDED_MOSQUITTO_PORT=1883
COPY entrypoint.sh entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]