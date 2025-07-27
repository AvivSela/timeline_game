# How to Check PostgreSQL Status

This guide shows you multiple ways to check if PostgreSQL is running and working properly.

## Quick Status Check

### 1. System Service Status
```bash
sudo systemctl status postgresql
```
**What to look for:**
- ✅ `Active: active (exited)` - Service is running
- ✅ `Loaded: loaded` - Service is enabled
- ❌ `Active: inactive` - Service is stopped
- ❌ `Active: failed` - Service failed to start

### 2. PostgreSQL Cluster Status
```bash
pg_lsclusters
```
**What to look for:**
- ✅ `Status: online` - Cluster is running
- ✅ `Port: 5432` - Listening on default port
- ❌ `Status: down` - Cluster is stopped

### 3. Connection Test
```bash
pg_isready -h localhost -p 5432
```
**What to look for:**
- ✅ `localhost:5432 - accepting connections` - Ready to accept connections
- ❌ `localhost:5432 - no response` - Not responding

## Detailed Status Checks

### 4. Port Listening Check
```bash
# Using ss (modern)
ss -tlnp | grep 5432

# Using netstat (if available)
sudo netstat -tlnp | grep 5432
```
**What to look for:**
- ✅ `LISTEN 0 244 127.0.0.1:5432` - Port is listening
- ❌ No output - Port is not listening

### 5. Process Check
```bash
ps aux | grep postgres
```
**What to look for:**
- ✅ Multiple postgres processes running
- ✅ Main process: `/usr/lib/postgresql/14/bin/postgres`
- ✅ Background processes: checkpoint, writer, walwriter, etc.
- ❌ No postgres processes

### 6. Database Connection Test
```bash
# Test connection with version query
psql -h localhost -U postgres -c "SELECT version();"

# Test connection to specific database
psql -h localhost -U postgres -d postgres -c "SELECT current_database();"
```
**What to look for:**
- ✅ Version information displayed
- ✅ No authentication errors
- ❌ `FATAL: password authentication failed` - Auth issue
- ❌ `could not connect to server` - Connection issue

## Test Database Specific Checks

### 7. Check Test Database Exists
```bash
sudo -u postgres psql -c "\l" | grep timeline_game_test
```
**What to look for:**
- ✅ `timeline_game_test` in the list
- ❌ Database not found

### 8. Test Database Connection
```bash
psql -h localhost -U postgres -d timeline_game_test -c "SELECT current_database();"
```
**What to look for:**
- ✅ `current_database` shows `timeline_game_test`
- ❌ `FATAL: database "timeline_game_test" does not exist`

## One-Liner Status Check

Here's a comprehensive one-liner to check everything:

```bash
echo "=== PostgreSQL Status Check ===" && \
echo "1. Service Status:" && \
sudo systemctl is-active postgresql && \
echo "2. Cluster Status:" && \
pg_lsclusters && \
echo "3. Connection Test:" && \
pg_isready -h localhost -p 5432 && \
echo "4. Port Listening:" && \
ss -tlnp | grep 5432 && \
echo "5. Test Database:" && \
sudo -u postgres psql -c "\l" | grep timeline_game_test && \
echo "=== Status Check Complete ==="
```

## Troubleshooting Common Issues

### Issue: Service Not Running
```bash
# Start the service
sudo systemctl start postgresql

# Enable auto-start
sudo systemctl enable postgresql

# Check logs
sudo journalctl -u postgresql -f
```

### Issue: Authentication Failed
```bash
# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Or update authentication method
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Change 'peer' to 'md5' for local connections
sudo systemctl restart postgresql
```

### Issue: Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :5432

# Kill conflicting process
sudo pkill -f postgres

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Issue: Database Doesn't Exist
```bash
# Create test database
sudo -u postgres createdb timeline_game_test

# Verify creation
sudo -u postgres psql -c "\l" | grep timeline_game_test
```

## Automated Status Check Script

Create a script to check everything at once:

```bash
#!/bin/bash

echo "=== PostgreSQL Status Check ==="

# Check service status
echo "1. Service Status:"
if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL service is running"
else
    echo "❌ PostgreSQL service is not running"
    exit 1
fi

# Check cluster status
echo "2. Cluster Status:"
if pg_lsclusters | grep -q "online"; then
    echo "✅ PostgreSQL cluster is online"
else
    echo "❌ PostgreSQL cluster is not online"
    exit 1
fi

# Check connection
echo "3. Connection Test:"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is accepting connections"
else
    echo "❌ PostgreSQL is not accepting connections"
    exit 1
fi

# Check test database
echo "4. Test Database:"
if sudo -u postgres psql -c "\l" 2>/dev/null | grep -q "timeline_game_test"; then
    echo "✅ Test database exists"
else
    echo "❌ Test database does not exist"
    echo "Creating test database..."
    sudo -u postgres createdb timeline_game_test
fi

echo "=== All checks passed! ==="
```

Save as `check_postgresql.sh` and run:
```bash
chmod +x check_postgresql.sh
./check_postgresql.sh
```

## Current Status Summary

Based on the checks we just ran:

✅ **PostgreSQL Service**: Running and enabled  
✅ **Cluster Status**: Online on port 5432  
✅ **Connection**: Accepting connections  
✅ **Port**: Listening on 127.0.0.1:5432  
✅ **Processes**: All background processes running  
✅ **Authentication**: Working (password prompt accepted)  
✅ **Version**: PostgreSQL 14.18  

Your PostgreSQL installation is working perfectly! You can now proceed with setting up your test database and running integration tests. 