# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine AS base

# Install dependencies needed for Redis and other packages
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    redis \
    supervisor \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

COPY ./akshayapatra .

# Install dependencies
RUN npm install

# Build the Next.js application
RUN npm run build

# Create Redis configuration
RUN mkdir -p /etc/redis
COPY <<EOF /etc/redis/redis.conf
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes
EOF

# Create supervisor configuration to manage both Next.js and Redis
RUN mkdir -p /etc/supervisor/conf.d
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:redis]
command=redis-server /etc/redis/redis.conf
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/redis.err.log
stdout_logfile=/var/log/supervisor/redis.out.log

[program:nextjs]
command=npm start
directory=/app
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/nextjs.err.log
stdout_logfile=/var/log/supervisor/nextjs.out.log
environment=NODE_ENV=production
EOF

# Create necessary directories
RUN mkdir -p /var/log/supervisor /var/run

# Expose ports
EXPOSE 3000 6379

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start supervisor to manage both services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
