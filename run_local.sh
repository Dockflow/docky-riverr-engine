#!/bin/sh
echo "Starting"
echo "Installing dependencies..."
npm install
docker-compose up -d --remove-orphans
echo "You can now start the dev server w/ 'npm run dev'"
