# Docker Setup for Akshayapatra

This project is dockerized with Next.js and Redis running in the same container using Supervisor for process management.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Next.js App: http://localhost:3000
   - Redis: localhost:6379
   - External Redis (optional): localhost:6380

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t akshayapatra .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name akshayapatra-app \
     -p 3000:3000 \
     -p 6379:6379 \
     -e NODE_ENV=production \
     -e REDIS_URL=redis://localhost:6379 \
     akshayapatra
   ```

3. **Stop the container:**
   ```bash
   docker stop akshayapatra-app
   docker rm akshayapatra-app
   ```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Other Configuration
NODE_ENV=production
```

### Redis Configuration

The Redis server is configured with the following settings:
- Port: 6379
- Max Memory: 256MB
- Memory Policy: allkeys-lru
- Persistence: AOF enabled
- Bind: 127.0.0.1 (localhost only)

## Services

### Supervisor

The container uses Supervisor to manage multiple processes:
- **Redis**: Running on port 6379
- **Next.js**: Running on port 3000

### Health Checks

The application includes health checks for:
- Next.js application availability
- Redis connectivity
- Database connectivity

Access the health endpoint: `http://localhost:3000/api/health`

## Development

### Development Mode

For development, you can run the application without Docker:

```bash
# Install dependencies
npm install

# Start Redis (if not running)
redis-server

# Start the development server
npm run dev
```

### Docker Development

For development with Docker:

```bash
# Build with development dependencies
docker build --target development -t akshayapatra:dev .

# Run in development mode
docker run -d \
  --name akshayapatra-dev \
  -p 3000:3000 \
  -p 6379:6379 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -e NODE_ENV=development \
  akshayapatra:dev
```

## Troubleshooting

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs akshayapatra

# View supervisor logs
docker exec akshayapatra-app cat /var/log/supervisor/supervisord.log
```

### Access Container Shell

```bash
docker exec -it akshayapatra-app sh
```

### Check Service Status

```bash
# Check supervisor status
docker exec akshayapatra-app supervisorctl status

# Check Redis
docker exec akshayapatra-app redis-cli ping

# Check Next.js
curl http://localhost:3000/api/health
```

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 6379 are not in use
2. **Permission issues**: Run Docker commands with appropriate permissions
3. **Memory issues**: Ensure sufficient memory for Redis (256MB minimum)

## Production Deployment

For production deployment:

1. **Set environment variables properly**
2. **Use a reverse proxy (nginx) for SSL termination**
3. **Configure proper logging**
4. **Set up monitoring and alerting**
5. **Use Docker secrets for sensitive data**

### Example Production Docker Compose

```yaml
version: '3.8'

services:
  akshayapatra:
    build: .
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://localhost:6379
    ports:
      - "3000:3000"
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

## Security Considerations

1. **Redis Security**: Redis is bound to localhost only
2. **Container Security**: Run as non-root user in production
3. **Network Security**: Use Docker networks for service communication
4. **Secrets Management**: Use Docker secrets for sensitive data

## Performance Optimization

1. **Multi-stage builds**: Reduces final image size
2. **Layer caching**: Optimized Dockerfile for better caching
3. **Alpine Linux**: Lightweight base image
4. **Redis optimization**: Configured for caching workloads
