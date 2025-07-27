# .env.test File Validation

This document explains how to validate your `.env.test` file to ensure it's properly configured for running tests.

## Overview

The `.env.test` file contains environment variables specifically for the test environment. Proper validation ensures that:

1. All required environment variables are present
2. Variables have the correct format
3. Database connectivity is working
4. Tests can run successfully

## Current .env.test Configuration

Your current `.env.test` file contains:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/timeline_game_test"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/timeline_game_test"
NODE_ENV=test
```

## Validation Process

### 1. Automated Validation

Run the validation script:

```bash
yarn test:env:validate
```

This script will:

- ✅ Check if `.env.test` file exists
- ✅ Validate all required environment variables are present
- ✅ Verify variable formats (PostgreSQL URLs, NODE_ENV value)
- ✅ Test database connectivity
- ✅ Provide a comprehensive validation report

### 2. Manual Validation

You can also manually check:

#### Required Variables

- **DATABASE_URL**: PostgreSQL connection string for test database
  - Format: `postgresql://username:password@host:port/database`
  - Should point to `timeline_game_test` database

- **DIRECT_URL**: Direct PostgreSQL connection string
  - Same format as DATABASE_URL
  - Used by Prisma for direct connections

- **NODE_ENV**: Node environment
  - Must be set to `test`

#### Database Connectivity

Ensure PostgreSQL is running and accessible:

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection with your credentials
psql -h localhost -U postgres -d timeline_game_test -c "SELECT 1;"
```

## Setup Test Database

If the validation fails due to database issues, set up the test database:

```bash
yarn test:db:setup
```

This script will:
1. Check if PostgreSQL is running
2. Create the `timeline_game_test` database
3. Run Prisma migrations
4. Seed test data

## Troubleshooting

### Common Issues

1. **PostgreSQL not running**
   ```bash
   # Start PostgreSQL (Ubuntu/Debian)
   sudo systemctl start postgresql
   
   # Or using Docker
   docker run --name postgres-test -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```

2. **Database doesn't exist**
   ```bash
   # Create database manually
   psql -h localhost -U postgres -c "CREATE DATABASE timeline_game_test;"
   ```

3. **Wrong credentials**
   - Update username/password in `.env.test`
   - Ensure PostgreSQL user has proper permissions

4. **Port conflicts**
   - Check if port 5432 is available
   - Update port in `.env.test` if using different port

### Validation Script Output

The validation script provides color-coded output:

- 🟢 **Green**: Success/valid
- 🟡 **Yellow**: Warning (non-critical issues)
- 🔴 **Red**: Error (critical issues)

## Integration with CI/CD

The validation script can be integrated into CI/CD pipelines:

```bash
# In your CI pipeline
yarn test:env:validate && yarn test
```

This ensures that:
1. Environment is properly configured before running tests
2. Tests have access to required resources
3. Failures are caught early in the development process

## Best Practices

1. **Never commit `.env.test` to version control** (it's in `.gitignore`)
2. **Use different databases** for development and testing
3. **Regular validation** - run validation before running tests
4. **Document changes** - update this document when adding new environment variables
5. **Team consistency** - share `.env.test` template with team members

## Related Files

- `scripts/validate-env-test.js` - Validation script
- `scripts/setup-test-db.sh` - Database setup script
- `src/tests/env-setup.ts` - Test environment setup
- `prisma/schema.prisma` - Database schema 