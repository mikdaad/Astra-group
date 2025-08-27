# Redis Setup Guide for RBAC System

This guide will help you set up Redis for the RBAC (Role-Based Access Control) system.

## Why Redis is Needed

The RBAC system uses Redis for:
- **Fast permission caching** - Reduces database queries
- **Session management** - Stores user sessions and permissions
- **Performance optimization** - Improves response times for permission checks

## Setup Options

### Option 1: Local Development with Docker (Recommended)

1. **Install Docker** (if not already installed)
   - Download from [docker.com](https://www.docker.com/)

2. **Run Redis Container**
   ```bash
   docker run -d --name redis-rbac -p 6379:6379 redis:alpine
   ```

3. **Verify Redis is Running**
   ```bash
   docker ps
   # Should show redis container running
   ```

4. **Test Connection**
   ```bash
   docker exec -it redis-rbac redis-cli ping
   # Should return "PONG"
   ```

### Option 2: Local Installation

1. **Windows**:
   - Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
   - Or use WSL2 with Ubuntu

2. **macOS**:
   ```bash
   brew install redis
   brew services start redis
   ```

3. **Linux (Ubuntu/Debian)**:
   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

### Option 3: Cloud Redis Services

1. **Redis Cloud** (Free tier available):
   - Sign up at [redis.com](https://redis.com/)
   - Create a database
   - Copy connection details

2. **Upstash Redis** (Free tier available):
   - Sign up at [upstash.com](https://upstash.com/)
   - Create a Redis database
   - Copy connection details

3. **AWS ElastiCache**:
   - Create Redis cluster in AWS Console
   - Configure security groups

## Environment Configuration

### For Local Development

Create a `.env.local` file in your project root:

```env
# Redis Configuration (Local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### For Cloud Services

```env
# Redis Configuration (Cloud)
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_URL=redis://:your-password@your-host:6379
```

## Testing Redis Connection

1. **Start your Next.js development server**:
   ```bash
   npm run dev
   ```

2. **Check console logs** for Redis connection status:
   - ✅ `Redis connected successfully` - Everything is working
   - ⚠️ `Redis not configured. RBAC caching will be disabled.` - Missing environment variables
   - ❌ `Redis connection error` - Connection failed

3. **Test RBAC functionality**:
   - Navigate to admin pages
   - Check if permissions are working
   - Monitor console for Redis operations

## Troubleshooting

### Common Issues

1. **"Redis not configured" warning**:
   - Check if `.env.local` file exists
   - Verify environment variable names
   - Restart development server after adding variables

2. **Connection refused**:
   - Ensure Redis is running
   - Check if port 6379 is available
   - Verify firewall settings

3. **Authentication failed**:
   - Check Redis password configuration
   - For local development, leave password empty

4. **Docker container not starting**:
   ```bash
   # Check container logs
   docker logs redis-rbac
   
   # Remove and recreate container
   docker rm redis-rbac
   docker run -d --name redis-rbac -p 6379:6379 redis:alpine
   ```

### Redis Commands for Debugging

```bash
# Connect to Redis CLI
docker exec -it redis-rbac redis-cli

# List all keys
KEYS *

# Check specific keys
GET session:user123
GET permissions:user123

# Clear all data
FLUSHALL

# Monitor Redis operations
MONITOR
```

## Production Deployment

### Environment Variables for Production

```env
# Production Redis Configuration
REDIS_HOST=your-production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_URL=redis://:your-password@your-host:6379
```

### Security Best Practices

1. **Use strong passwords** for Redis
2. **Enable SSL/TLS** for cloud Redis
3. **Restrict network access** with firewalls
4. **Regular backups** of Redis data
5. **Monitor Redis performance** and memory usage

### Deployment Platforms

1. **Vercel**: Add environment variables in Vercel dashboard
2. **Railway**: Configure Redis service in Railway
3. **Heroku**: Use Redis add-on
4. **AWS**: Use ElastiCache with proper security groups

## Performance Optimization

### Redis Configuration

```bash
# For production, consider these Redis settings
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Monitoring

1. **Redis Memory Usage**:
   ```bash
   docker exec -it redis-rbac redis-cli info memory
   ```

2. **Key Statistics**:
   ```bash
   docker exec -it redis-rbac redis-cli info keyspace
   ```

3. **Performance Metrics**:
   ```bash
   docker exec -it redis-rbac redis-cli info stats
   ```

## Fallback Behavior

If Redis is not available, the RBAC system will:
- Continue to work without caching
- Fetch permissions from database each time
- Log warnings about missing Redis
- Maintain full functionality (just slower)

This ensures your application remains functional even if Redis is down.
