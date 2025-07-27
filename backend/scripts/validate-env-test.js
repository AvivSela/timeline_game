#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvTest() {
  log('🔍 Validating .env.test file...', 'cyan');
  
  const envTestPath = path.join(__dirname, '..', '.env.test');
  
  // Check if file exists
  if (!fs.existsSync(envTestPath)) {
    log('❌ .env.test file not found!', 'red');
    return false;
  }
  
  log('✅ .env.test file exists', 'green');
  
  // Read and parse the file
  const envContent = fs.readFileSync(envTestPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=');
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key.trim()] = value.trim();
      }
    }
  });
  
  log(`📋 Found ${Object.keys(envVars).length} environment variables`, 'blue');
  
  // Required variables for test environment
  const requiredVars = {
    'DATABASE_URL': {
      required: true,
      pattern: /^postgresql:\/\/.+@.+:\d+\/.+$/,
      description: 'PostgreSQL connection string for test database'
    },
    'DIRECT_URL': {
      required: true,
      pattern: /^postgresql:\/\/.+@.+:\d+\/.+$/,
      description: 'Direct PostgreSQL connection string for test database'
    },
    'NODE_ENV': {
      required: true,
      pattern: /^test$/,
      description: 'Node environment (must be "test")'
    }
  };
  
  let allValid = true;
  
  // Validate each required variable
  for (const [varName, config] of Object.entries(requiredVars)) {
    log(`\n🔍 Checking ${varName}...`, 'blue');
    
    if (!envVars[varName]) {
      if (config.required) {
        log(`❌ ${varName} is required but not found`, 'red');
        allValid = false;
      } else {
        log(`⚠️  ${varName} is optional and not set`, 'yellow');
      }
      continue;
    }
    
    log(`✅ ${varName} is present`, 'green');
    
    // Check pattern if specified
    if (config.pattern && !config.pattern.test(envVars[varName])) {
      log(`❌ ${varName} format is invalid`, 'red');
      log(`   Expected: ${config.description}`, 'yellow');
      log(`   Got: ${envVars[varName]}`, 'yellow');
      allValid = false;
    } else if (config.pattern) {
      log(`✅ ${varName} format is valid`, 'green');
    }
    
    // Special validation for DATABASE_URL
    if (varName === 'DATABASE_URL') {
      const dbUrl = envVars[varName];
      if (!dbUrl.includes('timeline_game_test')) {
        log(`⚠️  Warning: DATABASE_URL should point to test database (timeline_game_test)`, 'yellow');
      }
    }
  }
  
  // Check for unexpected variables
  const unexpectedVars = Object.keys(envVars).filter(key => !requiredVars[key]);
  if (unexpectedVars.length > 0) {
    log(`\n⚠️  Unexpected variables found: ${unexpectedVars.join(', ')}`, 'yellow');
    log('   These may not be needed for testing', 'yellow');
  }
  
  // Test database connectivity
  log('\n🔍 Testing database connectivity...', 'cyan');
  testDatabaseConnection(envVars.DATABASE_URL)
    .then(isConnected => {
      if (isConnected) {
        log('✅ Database connection successful', 'green');
      } else {
        log('❌ Database connection failed', 'red');
        log('   Make sure PostgreSQL is running and the test database exists', 'yellow');
        log('   Run: yarn test:db:setup', 'yellow');
      }
      
      // Final summary
      log('\n📊 Validation Summary:', 'bright');
      if (allValid && isConnected) {
        log('✅ .env.test file is valid and database is accessible', 'green');
        return true;
      } else {
        log('❌ .env.test file has issues', 'red');
        return false;
      }
    })
    .catch(error => {
      log(`❌ Error testing database connection: ${error.message}`, 'red');
      return false;
    });
}

async function testDatabaseConnection(databaseUrl) {
  if (!databaseUrl) {
    log('❌ No DATABASE_URL provided', 'red');
    return false;
  }
  
  try {
    const client = new Client({
      connectionString: databaseUrl
    });
    
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    
    return true;
  } catch (error) {
    log(`❌ Database connection error: ${error.message}`, 'red');
    return false;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateEnvTest();
}

module.exports = { validateEnvTest }; 