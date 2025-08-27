// Server-side only Redis configuration
// This file should only be imported in server-side code (API routes, server components)

import type { Redis as IORedisClient } from 'ioredis'

let redis: IORedisClient | null = null

// Only initialize Redis on the server side
if (typeof window === 'undefined') {
  if (process.env.REDIS_HOST) {
    // Lazy require so the client bundle doesn't include ioredis
    // Normalize ESM default export vs CJS
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RedisMod = require('ioredis') as typeof import('ioredis')
    const RedisCtor = (RedisMod as any).default ?? RedisMod

    try {
      redis = new (RedisCtor as new (...args: any[]) => IORedisClient)({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3,
        lazyConnect: false, // Connect immediately
        enableOfflineQueue: true, // Allow offline queue
        retryDelayOnFailover: 100,
        retryDelayOnClusterDown: 300,
        retryDelayOnTryAgain: 100,
      })

      // Handle connection events
      redis.on('connect', () => {
        console.log('✅ Redis connected successfully')
      })

      redis.on('ready', () => {
        console.log('✅ Redis is ready to accept commands')
      })

      redis.on('error', (error: unknown) => {
        console.error('❌ Redis connection error:', (error as Error).message)
      })

      redis.on('close', () => {
        console.log('🔌 Redis connection closed')
      })

      redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...')
      })
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
      redis = null
    }
  } else {
    console.warn('⚠️ Redis not configured. RBAC caching will be disabled.')
  }
}

export default redis

// Redis key patterns
export const REDIS_KEYS = {
  USER_SESSION: (userId: string) => `session:${userId}`,
  STAFF_PERMISSIONS: (staffId: string) => `staff:permissions:${staffId}`,
  ROLE_PERMISSIONS: (role: string) => `role:${role}:permissions`,
  ADMIN_CACHE: (key: string) => `admin:${key}`,
} as const

// Session management with fallback
export class SessionManager {
  static async setUserSession(userId: string, sessionData: unknown, ttl: number = 3600) {
    if (!redis) {
      console.warn('Redis not available, skipping session cache')
      return
    }
    try {
      const key = REDIS_KEYS.USER_SESSION(userId)
      await redis.setex(key, ttl, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error setting user session:', error)
    }
  }

  static async getUserSession(userId: string): Promise<unknown | null> {
    if (!redis) return null
    try {
      const key = REDIS_KEYS.USER_SESSION(userId)
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting user session:', error)
      return null
    }
  }

  static async deleteUserSession(userId: string) {
    if (!redis) return
    try {
      const key = REDIS_KEYS.USER_SESSION(userId)
      await redis.del(key)
    } catch (error) {
      console.error('Error deleting user session:', error)
    }
  }

  static async deleteStaffPermissions(staffId: string) {
    if (!redis) return
    try {
      const key = REDIS_KEYS.STAFF_PERMISSIONS(staffId)
      await redis.del(key)
    } catch (error) {
      console.error('Error deleting staff permissions:', error)
    }
  }

  static async setStaffPermissions(staffId: string, permissions: string[], ttl: number = 3600) {
    if (!redis) {
      console.warn('Redis not available, skipping permissions cache')
      return
    }
    try {
      if (redis.status !== 'ready') {
        console.warn('Redis not ready, skipping cache')
        return
      }
      const key = REDIS_KEYS.STAFF_PERMISSIONS(staffId)
      await redis.setex(key, ttl, JSON.stringify(permissions))
      console.log(`💾 Set Redis cache for key: ${key} with TTL: ${ttl}s`)
    } catch (error) {
      console.error('Error setting staff permissions in Redis:', error)
    }
  }

  static async getStaffPermissions(staffId: string): Promise<string[]> {
    if (!redis) {
      console.warn('Redis not available, returning empty permissions')
      return []
    }
    try {
      if (redis.status !== 'ready') {
        console.warn('Redis not ready, skipping cache')
        return []
      }
      const key = REDIS_KEYS.STAFF_PERMISSIONS(staffId)
      const data = await redis.get(key)
      if (data) {
        console.log(`📋 Redis cache hit for key: ${key}`)
        return JSON.parse(data) as string[]
      } else {
        console.log(`❌ Redis cache miss for key: ${key}`)
        return []
      }
    } catch (error) {
      console.error('Error getting staff permissions from Redis:', error)
      return []
    }
  }

  static async cacheRolePermissions(role: string, permissions: string[], ttl: number = 86400) {
    if (!redis) return
    try {
      const key = REDIS_KEYS.ROLE_PERMISSIONS(role)
      await redis.setex(key, ttl, JSON.stringify(permissions))
    } catch (error) {
      console.error('Error caching role permissions:', error)
    }
  }

  static async getRolePermissions(role: string): Promise<string[]> {
    if (!redis) return []
    try {
      const key = REDIS_KEYS.ROLE_PERMISSIONS(role)
      const data = await redis.get(key)
      return data ? (JSON.parse(data) as string[]) : []
    } catch (error) {
      console.error('Error getting role permissions:', error)
      return []
    }
  }

  // Health check method
  static async isHealthy(): Promise<boolean> {
    if (!redis) return false
    try {
      await redis.ping()
      return true
    } catch (error) {
      console.error('Redis health check failed:', error)
      return false
    }
  }
}
