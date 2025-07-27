# Test Database Setup Guide

This guide explains how to set up a real test database for integration testing of the Timeline Game backend.

## Overview

The project includes two types of database tests:

1. **Unit Tests** (`database.test.ts`) - Use mocks and don't require a real database
2. **Integration Tests** (`database-integration.test.ts`) - Use a real PostgreSQL database

## Prerequisites

- PostgreSQL installed and running
- Node.js and Yarn installed
- Access to create databases

## Quick Setup

### 1. Install PostgreSQL (if not already installed)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Start PostgreSQL Service

```bash
# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew services start postgresql

# Check if running
pg_isready -h localhost -p 5432
```

### 3. Create Test Database

```bash
# Connect as postgres user
sudo -u postgres psql

# Create test database
CREATE DATABASE timeline_game_test;

# Set password for postgres user (if needed)
ALTER USER postgres PASSWORD 'postgres';

# Exit
\q
```

### 4. Configure Test Environment

The test environment is configured in `.env.test`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/timeline_game_test"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/timeline_game_test"
NODE_ENV=test
```

**Note**: If PostgreSQL is running on a different port (e.g., 5433), update the URLs accordingly.

### 5. Run Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to test database
npx prisma db push --schema=./prisma/schema.prisma

# Or use the setup script
./scripts/setup-test-db.sh
```

## Running Tests

### Unit Tests (Mocked Database)

```bash
# Run only unit tests
yarn test:unit

# Run all tests (unit + integration if database available)
yarn test
```

### Integration Tests (Real Database)

```bash
# Run only integration tests
yarn test:integration

# Run all tests
yarn test
```

### Test Coverage

```bash
# Run tests with coverage
yarn test:coverage
```

## Test Scripts

The following scripts are available in `package.json`:

- `yarn test` - Run all tests
- `yarn test:unit` - Run only unit tests (mocked)
- `yarn test:integration` - Run only integration tests (real database)
- `yarn test:coverage` - Run tests with coverage report
- `yarn test:db:setup` - Set up test database
- `yarn test:db:reset` - Reset test database

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL Status**
   ```bash
   sudo systemctl status postgresql
   pg_isready -h localhost -p 5432
   ```

2. **Check Database Exists**
   ```bash
   sudo -u postgres psql -l | grep timeline_game_test
   ```

3. **Check Authentication**
   ```bash
   # Test connection
   psql -h localhost -U postgres -d timeline_game_test
   ```

### Port Issues

If PostgreSQL is running on a different port:

1. Check the port:
   ```bash
   pg_lsclusters
   ```

2. Update `.env.test` with the correct port:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/timeline_game_test"
   ```

### Permission Issues

If you get permission errors:

1. **Fix PostgreSQL authentication**:
   ```bash
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'postgres';
   \q
   ```

2. **Update pg_hba.conf** (if needed):
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   # Change 'peer' to 'md5' for local connections
   ```

## Test Structure

### Unit Tests (`database.test.ts`)
- Use mocked `DatabaseService`
- Test service interface without database dependency
- Fast execution
- No external dependencies

### Integration Tests (`database-integration.test.ts`)
- Use real `TestDatabaseService`
- Test actual database operations
- Verify data integrity and relationships
- Test concurrent operations

### Test Database Service (`TestDatabaseService.ts`)
- Extends `DatabaseService` for testing
- Includes cleanup and seeding methods
- Uses test environment configuration
- Handles test data isolation

## Best Practices

1. **Always clean up test data** between tests
2. **Use unique test data** to avoid conflicts
3. **Test both success and failure scenarios**
4. **Verify data integrity** and relationships
5. **Test concurrent operations** for race conditions

## CI/CD Integration

For continuous integration, you can:

1. Use a containerized PostgreSQL instance
2. Set up test database in CI pipeline
3. Run integration tests in isolated environment
4. Use database snapshots for faster test setup

Example GitHub Actions setup:

```yaml
- name: Setup PostgreSQL
  uses: Harmon758/postgresql-action@v1.0.0
  with:
    postgresql version: '14'
    postgresql db: 'timeline_game_test'

- name: Run Tests
  run: |
    yarn install
    yarn test:db:setup
    yarn test
``` 