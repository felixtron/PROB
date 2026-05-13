#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL must be set" >&2
  exit 1
fi

node /app/node_modules/prisma/build/index.js migrate deploy --schema=/app/prisma/schema.prisma

exec node server.js
