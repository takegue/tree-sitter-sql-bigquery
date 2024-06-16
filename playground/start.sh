#!/bin/bash

# Go to the right directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || { echo "Directory not found: $SCRIPT_DIR"; exit 1; }

# Start the server and get the PID
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!
disown $SERVER_PID

# Check if the server started successfully
sleep 2
if ps -p $SERVER_PID > /dev/null
then
  echo "Server http://localhost:8000 started successfully with PID $SERVER_PID"
else
  echo "Failed to start server"
  exit 1
fi

# Define a cleanup function
cleanup() {
  # Check if the server process is still running
  if ps -p $SERVER_PID > /dev/null; then
    echo
    echo "Stopping the server..."
    kill $SERVER_PID
  fi
  exit 0
}

# Set trap to call cleanup when script exits or is interrupted
trap cleanup EXIT INT

# Open the default web browser
case "$OSTYPE" in
  linux-gnu*)
    xdg-open http://localhost:8000/
    ;;
  darwin*)
    open http://localhost:8000/
    ;;
  cygwin*|msys*)
    start http://localhost:8000/
    ;;
  *)
    echo "Unsupported OS"
    ;;
esac

# Wait for the user to close the server
read -p "Press [Enter] to stop the server..."