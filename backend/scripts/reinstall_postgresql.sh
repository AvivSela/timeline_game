#!/bin/bash

echo "=== PostgreSQL Clean Reinstall Script ==="
echo "This script will completely remove PostgreSQL and reinstall it fresh."
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Please don't run this script as root. Use sudo when prompted."
    exit 1
fi

echo "Step 1: Stopping PostgreSQL services..."
sudo systemctl stop postgresql 2>/dev/null || true
sudo systemctl disable postgresql 2>/dev/null || true

echo "Step 2: Removing PostgreSQL packages..."
sudo apt remove --purge postgresql* -y
sudo apt autoremove --purge -y

echo "Step 3: Cleaning up PostgreSQL files..."
sudo rm -rf /var/lib/postgresql/ 2>/dev/null || true
sudo rm -rf /var/log/postgresql/ 2>/dev/null || true
sudo rm -rf /etc/postgresql/ 2>/dev/null || true
sudo rm -rf /etc/init.d/postgresql 2>/dev/null || true
sudo rm -rf /etc/systemd/system/postgresql.service* 2>/dev/null || true

echo "Step 4: Removing postgres user..."
sudo userdel -r postgres 2>/dev/null || true
sudo groupdel postgres 2>/dev/null || true

echo "Step 5: Cleaning package cache..."
sudo apt clean
sudo apt autoclean

echo "Step 6: Installing PostgreSQL..."
sudo apt update
sudo apt install postgresql postgresql-contrib -y

echo "Step 7: Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "Step 8: Configuring PostgreSQL..."
# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || true

# Create test database
sudo -u postgres createdb timeline_game_test 2>/dev/null || true

echo "Step 9: Verifying installation..."
# Check status
if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

# Check if port is listening
if sudo netstat -tlnp 2>/dev/null | grep -q ":5432"; then
    echo "✅ PostgreSQL is listening on port 5432"
else
    echo "❌ PostgreSQL is not listening on port 5432"
    exit 1
fi

echo ""
echo "=== PostgreSQL Installation Complete! ==="
echo ""
echo "Next steps:"
echo "1. Test connection: psql -h localhost -U postgres -d timeline_game_test"
echo "2. Update .env.test with: DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/timeline_game_test\""
echo "3. Run: npx prisma db push --schema=./prisma/schema.prisma"
echo "4. Test: yarn test:integration"
echo ""
echo "If you get authentication errors, you may need to update pg_hba.conf:"
echo "sudo nano /etc/postgresql/*/main/pg_hba.conf"
echo "Change 'peer' to 'md5' for local connections"
echo "Then restart: sudo systemctl restart postgresql" 