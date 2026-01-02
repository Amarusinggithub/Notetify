#!/bin/bash

CONTAINER_NAME="redis-notetify"

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Container $CONTAINER_NAME is already running."
else
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        echo "Starting existing $CONTAINER_NAME container..."
        docker start $CONTAINER_NAME
    else
        echo "Creating and starting new $CONTAINER_NAME container..."
        docker run --name $CONTAINER_NAME -p 6379:6379 -d redis:latest
    fi
fi
