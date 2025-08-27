#!/usr/bin/env node

/**
 * Zoho Desk Integration Test Script
 * This script tests the Zoho Desk API integration endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  endpoints: [
    {
      name: 'Test Authentication',
      method: 'POST',
      path: '/api/admin/zoho/auth',
      body: {}
    },
    {
      name: 'Fetch Tickets',
      method: 'GET',
      path: '/api/admin/zoho/tickets?limit=10'
    },
    {
      name: 'Fetch Statistics',
      method: 'GET',
      path: '/api/admin/zoho/stats?timeframe=thisMonth'
    },
    {
      name: 'Filter Tickets by Status',
      method: 'GET',
      path: '/api/admin/zoho/tickets?status=Open&limit=5'
    },
    {
      name: 'Test OAuth Callback Route',
      method: 'GET',
      path: '/auth/zoho/callback?error=access_denied'
    }
  ]
};

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(config.timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

// Test a single endpoint
async function testEndpoint(endpoint) {
  const url = new URL(endpoint.path, config.baseUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Zoho-Integration-Test/1.0'
    },
    protocol: url.protocol
  };
  
  console.log(`${colors.blue}Testing:${colors.reset} ${endpoint.name}`);
  console.log(`${colors.yellow}→${colors.reset} ${endpoint.method} ${endpoint.path}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(options, endpoint.body);
    const duration = Date.now() - startTime;
    
    // Determine success/failure
    const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    const statusColor = isSuccess ? colors.green : colors.red;
    const statusSymbol = isSuccess ? '✓' : '✗';
    
    console.log(`${statusColor}${statusSymbol}${colors.reset} ${response.statusCode} (${duration}ms)`);
    
    // Show response summary
    if (response.data && typeof response.data === 'object') {
      if (response.data.success) {
        console.log(`  ${colors.green}Success:${colors.reset} ${response.data.message || 'Request completed'}`);
        
        // Show data summary based on endpoint
        if (endpoint.path.includes('/tickets')) {
          const tickets = response.data.tickets || [];
          console.log(`  ${colors.blue}Tickets:${colors.reset} ${tickets.length} found`);
          if (tickets.length > 0) {
            console.log(`  ${colors.blue}Sample:${colors.reset} #${tickets[0].ticketNumber} - ${tickets[0].subject?.substring(0, 50)}...`);
          }
        } else if (endpoint.path.includes('/stats')) {
          const stats = response.data.stats || {};
          console.log(`  ${colors.blue}Stats:${colors.reset} ${stats.totalTickets || 0} total, ${stats.openTickets || 0} open, ${stats.resolvedTickets || 0} resolved`);
        } else if (endpoint.path.includes('/auth')) {
          console.log(`  ${colors.blue}Auth:${colors.reset} Token generated successfully`);
        }
      } else {
        console.log(`  ${colors.red}Error:${colors.reset} ${response.data.error || 'Unknown error'}`);
        if (response.data.details) {
          console.log(`  ${colors.red}Details:${colors.reset} ${response.data.details}`);
        }
      }
    } else {
      console.log(`  ${colors.yellow}Response:${colors.reset} ${JSON.stringify(response.data).substring(0, 100)}...`);
    }
    
    if (response.parseError) {
      console.log(`  ${colors.red}Parse Error:${colors.reset} ${response.parseError}`);
    }
    
    console.log(''); // Empty line for spacing
    
    return {
      endpoint: endpoint.name,
      success: isSuccess,
      statusCode: response.statusCode,
      duration,
      error: !isSuccess ? (response.data?.error || `HTTP ${response.statusCode}`) : null
    };
    
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Request failed: ${error.message}`);
    console.log(''); // Empty line for spacing
    
    return {
      endpoint: endpoint.name,
      success: false,
      statusCode: null,
      duration: null,
      error: error.message
    };
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.bold}${colors.blue}Zoho Desk Integration Test${colors.reset}`);
  console.log(`${colors.blue}Base URL:${colors.reset} ${config.baseUrl}`);
  console.log(`${colors.blue}Timeout:${colors.reset} ${config.timeout}ms`);
  console.log('');
  
  const results = [];
  
  for (const endpoint of config.endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Summary
  console.log(`${colors.bold}${colors.blue}Test Summary${colors.reset}`);
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`${colors.green}Passed:${colors.reset} ${passed}/${total}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failed}/${total}`);
  
  if (failed > 0) {
    console.log('');
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.filter(r => !r.success).forEach(result => {
      console.log(`  ${colors.red}✗${colors.reset} ${result.endpoint}: ${result.error}`);
    });
  }
  
  // Calculate average response time for successful requests
  const successfulResults = results.filter(r => r.success && r.duration);
  if (successfulResults.length > 0) {
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
    console.log('');
    console.log(`${colors.blue}Average Response Time:${colors.reset} ${Math.round(avgDuration)}ms`);
  }
  
  console.log('');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Environment check
function checkEnvironment() {
  console.log(`${colors.blue}Environment Check:${colors.reset}`);
  
  const requiredEnvVars = [
    'ZOHO_CLIENT_ID',
    'ZOHO_CLIENT_SECRET', 
    'ZOHO_REFRESH_TOKEN',
    'ZOHO_ORG_ID'
  ];
  
  const missing = [];
  const present = [];
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });
  
  present.forEach(varName => {
    console.log(`  ${colors.green}✓${colors.reset} ${varName}`);
  });
  
  missing.forEach(varName => {
    console.log(`  ${colors.red}✗${colors.reset} ${varName} (missing)`);
  });
  
  if (missing.length > 0) {
    console.log('');
    console.log(`${colors.red}Warning:${colors.reset} Missing environment variables. Some tests may fail.`);
  }
  
  console.log('');
}

// Usage information
function showUsage() {
  console.log(`${colors.bold}Usage:${colors.reset}`);
  console.log('  node scripts/test-zoho-integration.js');
  console.log('');
  console.log(`${colors.bold}Environment Variables:${colors.reset}`);
  console.log('  TEST_BASE_URL  - Base URL for testing (default: http://localhost:3000)');
  console.log('  ZOHO_CLIENT_ID - Your Zoho API Client ID');
  console.log('  ZOHO_CLIENT_SECRET - Your Zoho API Client Secret');
  console.log('  ZOHO_REFRESH_TOKEN - Your Zoho API Refresh Token');
  console.log('  ZOHO_ORG_ID - Your Zoho Organization ID');
  console.log('');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the tests
(async () => {
  try {
    checkEnvironment();
    await runTests();
  } catch (error) {
    console.error(`${colors.red}Test runner error:${colors.reset} ${error.message}`);
    process.exit(1);
  }
})();
