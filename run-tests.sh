#!/bin/bash

# Start the server in the background
echo "Starting server..."
cd server
node index.js &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Run tests
echo "Running tests..."
cd ..
node test.js

# Kill the server
echo "Stopping server..."
kill $SERVER_PID