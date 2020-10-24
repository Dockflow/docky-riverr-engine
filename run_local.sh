#!/bin/sh
echo "Starting"
echo "Installing dependencies..."
npm install --legacy-peer-deps
docker-compose up -d --remove-orphans
echo "You can now start the dev server w/ 'npm run dev'"
