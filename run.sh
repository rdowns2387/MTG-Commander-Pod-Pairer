#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm run install-all

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! nc -z localhost 27017; then
  echo "MongoDB is not running. Please start MongoDB and try again."
  exit 1
fi

# Start the application in development mode
echo "Starting the application..."
npm run dev