#!/usr/bin/env node

/**
 * Test Individual Zoho APIs
 * This script tests each Zoho API endpoint separately to isolate issues
 */

const https = require('https');

// Configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 15000
};

// Test individual endpoints
const endpoints = [
  {
    name: 'Test Auth Token',
    path: '/api/admin/zoho/auth',
    method: 'POST'
  },
  {
    name: 'Test Basic Tickets (limit 1)',
    path: '/api/admin/zoho/tickets?limit=1',
    method: 'GET'
  },
  {
    name: 'Test Open Tickets',
    path: '/api/admin/zoho/tickets?status=Open&limit=5',
    method: 'GET'
  },
  {
    name: 'Test Stats API',
    path: '/api/admin/zoho/stats?timeframe=thisMonth',
    method: 'GET'
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n🧪 Testing: ${endpoint.name}`);
  console.log(`   ${endpoint.method} ${endpoint.path}`);
  
  try {
    const url = new URL(endpoint.path, config.baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    };

    const response = await makeRequest(options, endpoint.method === 'POST' ? {} : null);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`   ✅ Success: ${response.statusCode}`);
      
      // Show relevant data summary
      if (response.data && typeof response.data === 'object') {
        if (endpoint.path.includes('/tickets')) {
          const tickets = response.data.tickets || [];
          console.log(`   📋 Tickets: ${tickets.length} found`);
          if (tickets.length > 0) {
            console.log(`   🎫 Sample: ${tickets[0].ticketNumber} - ${tickets[0].subject?.substring(0, 30)}...`);
          }
        } else if (endpoint.path.includes('/stats')) {
          const stats = response.data.stats || {};
          console.log(`   📊 Stats: ${stats.totalTickets || 0} total, ${stats.openTickets || 0} open`);
        } else if (endpoint.path.includes('/auth')) {
          console.log(`   🔑 Token: ${response.data.success ? 'Generated' : 'Failed'}`);
        }
      }
    } else {
      console.log(`   ❌ Error: ${response.statusCode}`);
      if (response.data) {
        console.log(`   📝 Message: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    }
    
    return response.statusCode >= 200 && response.statusCode < 300;
    
  } catch (error) {
    console.log(`   💥 Failed: ${error.message}`);
    return false;
  }
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = require('http').request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          // If JSON parsing fails, return raw data
          resolve({
            statusCode: res.statusCode,
            data: data,
            parseError: true
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(options.timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🔬 Testing Individual Zoho API Endpoints\n');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Timeout: ${config.timeout}ms`);
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Check your .env.local has all required Zoho variables');
    console.log('2. Verify ZOHO_ORG_ID is correct');
    console.log('3. Ensure your refresh token is valid');
    console.log('4. Check terminal logs for detailed error messages');
  }
}

// Run tests
runTests().catch(console.error);
