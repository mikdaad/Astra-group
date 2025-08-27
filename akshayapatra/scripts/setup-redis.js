#!/usr/bin/env node

/**
 * Redis Setup Script for RBAC System
 * This script helps you set up Redis for local development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Redis Setup for RBAC System\n');

// Check if Docker is available
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if Redis container is running
function checkRedisContainer() {
  try {
    const output = execSync('docker ps --filter "name=redis-rbac" --format "{{.Names}}"', { encoding: 'utf8' });
    return output.trim() === 'redis-rbac';
  } catch (error) {
    return false;
  }
}

// Start Redis container
function startRedisContainer() {
  try {
    console.log('📦 Starting Redis container...');
    execSync('docker run -d --name redis-rbac -p 6379:6379 redis:alpine', { stdio: 'inherit' });
    console.log('✅ Redis container started successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to start Redis container:', error.message);
    return false;
  }
}

// Test Redis connection
function testRedisConnection() {
  try {
    console.log('🔍 Testing Redis connection...');
    const output = execSync('docker exec redis-rbac redis-cli ping', { encoding: 'utf8' });
    if (output.trim() === 'PONG') {
      console.log('✅ Redis connection successful!');
      return true;
    } else {
      console.log('❌ Redis connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Redis connection test failed:', error.message);
    return false;
  }
}

// Create .env.local file if it doesn't exist
function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('📝 .env.local file already exists');
    return;
  }

  const envContent = `# Redis Configuration (Local Development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Add your Supabase configuration here
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with Redis configuration');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
  }
}

// Main setup function
function main() {
  console.log('🔍 Checking system requirements...\n');

  // Check Docker
  if (!checkDocker()) {
    console.log('❌ Docker is not installed or not available');
    console.log('📖 Please install Docker from https://docker.com/');
    console.log('💡 Alternative: Use a cloud Redis service like Redis Cloud or Upstash');
    process.exit(1);
  }

  console.log('✅ Docker is available');

  // Check if Redis container is already running
  if (checkRedisContainer()) {
    console.log('✅ Redis container is already running');
  } else {
    console.log('📦 Redis container not found, starting...');
    if (!startRedisContainer()) {
      process.exit(1);
    }
  }

  // Test connection
  if (!testRedisConnection()) {
    process.exit(1);
  }

  // Create .env.local file
  createEnvFile();

  console.log('\n🎉 Redis setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Add your Supabase configuration to .env.local');
  console.log('2. Start your development server: npm run dev');
  console.log('3. Check console logs for Redis connection status');
  console.log('\n🔧 Useful Redis commands:');
  console.log('  - Connect to Redis CLI: docker exec -it redis-rbac redis-cli');
  console.log('  - View Redis logs: docker logs redis-rbac');
  console.log('  - Stop Redis: docker stop redis-rbac');
  console.log('  - Remove Redis: docker rm redis-rbac');
}

// Run setup
main();
