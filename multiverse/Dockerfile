# Use the official Golang image as a base
FROM golang:1.16

# Set environment variables
ENV GO111MODULE=on

# Install git, make, gcc, and other build dependencies
RUN apt-get update && apt-get install -y git make gcc libc6-dev

# Clone the Multiverse repository
RUN git clone https://github.com/multiverse-vcs/go-multiverse.git /go-multiverse

# Change directory to the cloned repository
WORKDIR /go-multiverse

# Build and install Multiverse
RUN make install

# Create a directory for the project and switch to it
WORKDIR /fleeta-vehicles-data

# Copy entrypoint script into the container
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose necessary ports (if any)
# EXPOSE 4001 5001 8080

# Run the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
