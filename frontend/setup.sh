#!/usr/bin/env bash
set -e
echo "Installing frontend dependencies (npm)"
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env created from .env.example — update values as needed"
else
  echo ".env already exists — skipping copy"
fi
echo "Start dev server with: npm run dev"
