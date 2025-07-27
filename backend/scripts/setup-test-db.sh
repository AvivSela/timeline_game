#!/bin/bash

# Test Database Setup Script
echo "Setting up test database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432; then
    echo "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create test database if it doesn't exist
echo "Creating test database..."
psql -h localhost -U postgres -c "CREATE DATABASE timeline_game_test;" 2>/dev/null || echo "Database already exists"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Seed test data
echo "Seeding test data..."
npx prisma db seed --schema=./prisma/schema.prisma

echo "Test database setup complete!" 