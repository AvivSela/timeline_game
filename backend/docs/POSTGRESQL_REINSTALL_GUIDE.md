# PostgreSQL Uninstall and Reinstall Guide

This guide will help you completely remove PostgreSQL and reinstall it fresh.

## Step 1: Stop and Disable PostgreSQL Services

```bash
# Stop PostgreSQL service
sudo systemctl stop postgresql

# Disable PostgreSQL service
sudo systemctl disable postgresql

# Check if any PostgreSQL processes are still running
ps aux | grep postgres
```

## Step 2: Remove PostgreSQL Packages

```bash
# Remove all PostgreSQL packages
sudo apt remove --purge postgresql*

# Remove any remaining configuration files
sudo apt autoremove --purge

# Clean up any remaining files
sudo rm -rf /var/lib/postgresql/
sudo rm -rf /var/log/postgresql/
sudo rm -rf /etc/postgresql/
sudo rm -rf /etc/init.d/postgresql
sudo rm -rf /etc/systemd/system/postgresql.service
sudo rm -rf /etc/systemd/system/postgresql.service.d
```

## Step 3: Remove PostgreSQL User

```bash
# Remove the postgres user and group
sudo userdel -r postgres
sudo groupdel postgres
```

## Step 4: Clean Up Package Cache

```bash
# Clean package cache
sudo apt clean
sudo apt autoclean
```

## Step 5: Reinstall PostgreSQL

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Enable PostgreSQL service
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

## Step 6: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Set password for postgres user
ALTER USER postgres PASSWORD 'postgres';

# Create test database
CREATE DATABASE timeline_game_test;

# Exit PostgreSQL
\q
```

## Step 7: Test Connection

```bash
# Test connection
psql -h localhost -U postgres -d timeline_game_test

# You should be prompted for password: postgres
# Type \q to exit
```

## Step 8: Update Test Environment

Update your `.env.test` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/timeline_game_test"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/timeline_game_test"
NODE_ENV=test
```

## Step 9: Set Up Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push --schema=./prisma/schema.prisma
```

## Step 10: Test Database Integration

```bash
# Run integration tests
yarn test:integration

# Or run all tests
yarn test
```

## Troubleshooting

### If you get permission errors:

```bash
# Check PostgreSQL authentication configuration
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Change these lines:
# local   all             postgres                                peer
# To:
# local   all             postgres                                md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### If PostgreSQL won't start:

```bash
# Check logs
sudo journalctl -u postgresql

# Check if port is in use
sudo netstat -tlnp | grep 5432

# Kill any conflicting processes
sudo pkill -f postgres
```

### If you can't connect:

```bash
# Check if PostgreSQL is listening
sudo netstat -tlnp | grep 5432

# Check firewall
sudo ufw status

# Allow PostgreSQL through firewall
sudo ufw allow 5432
```

## Alternative: Using Docker

If you prefer to use Docker instead:

```bash
# Pull PostgreSQL image
docker pull postgres:14

# Run PostgreSQL container
docker run --name postgres-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=timeline_game_test \
  -p 5432:5432 \
  -d postgres:14

# Update .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/timeline_game_test"
```

## Verification Commands

After installation, verify everything is working:

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if port is listening
sudo netstat -tlnp | grep 5432

# Test connection
psql -h localhost -U postgres -d timeline_game_test

# Run tests
yarn test:integration
```

## Complete Clean Reinstall Script

Here's a complete script to automate the process:

```bash
#!/bin/bash

echo "Stopping PostgreSQL..."
sudo systemctl stop postgresql
sudo systemctl disable postgresql

echo "Removing PostgreSQL packages..."
sudo apt remove --purge postgresql* -y
sudo apt autoremove --purge -y

echo "Cleaning up files..."
sudo rm -rf /var/lib/postgresql/
sudo rm -rf /var/log/postgresql/
sudo rm -rf /etc/postgresql/
sudo rm -rf /etc/init.d/postgresql
sudo rm -rf /etc/systemd/system/postgresql.service*

echo "Removing postgres user..."
sudo userdel -r postgres 2>/dev/null || true
sudo groupdel postgres 2>/dev/null || true

echo "Cleaning package cache..."
sudo apt clean
sudo apt autoclean

echo "Installing PostgreSQL..."
sudo apt update
sudo apt install postgresql postgresql-contrib -y

echo "Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "Configuring PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb timeline_game_test

echo "PostgreSQL installation complete!"
echo "Test connection with: psql -h localhost -U postgres -d timeline_game_test"
```

Save this as `reinstall_postgresql.sh` and run:
```bash
chmod +x reinstall_postgresql.sh
./reinstall_postgresql.sh
``` 