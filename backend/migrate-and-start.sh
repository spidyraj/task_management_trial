#!/bin/bash
echo "Starting database migration..."
npx prisma migrate deploy
echo "Migration completed. Starting server..."
npm start
