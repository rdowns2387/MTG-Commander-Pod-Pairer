#!/bin/bash

# Check if MongoDB is running
if nc -z localhost 27017; then
  echo "MongoDB is already running"
else
  echo "Starting MongoDB..."
  
  # Check if MongoDB is installed
  if command -v mongod &> /dev/null; then
    # Start MongoDB
    mongod --dbpath ./data/db &
    echo "MongoDB started"
  else
    echo "MongoDB is not installed. Please install MongoDB or use Docker."
    echo "To use Docker, run: docker-compose up mongo -d"
  fi
fi