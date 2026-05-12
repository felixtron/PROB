#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL must be set" >&2
  exit 1
fi

npx prisma migrate deploy --schema=./prisma/schema.prisma

exec node server.js
