// lib/retry-utils.ts

export interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
  retryCondition?: (error: any) => boolean
}

/**
 * Retry logic for network-sensitive operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    retryCondition = (error) => {
      // Retry on network errors but not on auth errors
      return error?.name === 'TypeError' || 
             error?.message?.includes('fetch') ||
             error?.message?.includes('network') ||
             error?.code === 'NETWORK_ERROR'
    }
  } = options

  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation()
      return result
    } catch (error) {
      lastError = error
      
      // Don't retry if this isn't a retryable error
      if (!retryCondition(error)) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break
      }
      
      // Calculate delay with optional backoff
      const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay
      
      console.warn(`Retry attempt ${attempt}/${maxAttempts} after ${currentDelay}ms:`, (error as Error).message || 'Unknown error')
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, currentDelay))
    }
  }
  
  throw lastError
}

/**
 * Specific retry wrapper for Supabase auth operations
 */
export async function withAuthRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 2, // Limited retries for auth operations
    delay: 500,
    backoff: false,
    retryCondition: (error) => {
      // Only retry on network errors, not auth errors
      const isNetworkError = error?.name === 'TypeError' || 
                            error?.message?.includes('fetch failed') ||
                            error?.message?.includes('Network error')
      
      const isNotAuthError = !error?.message?.includes('invalid_token') &&
                             !error?.message?.includes('session_not_found') &&
                             !error?.message?.includes('unauthorized')
      
      return isNetworkError && isNotAuthError
    }
  })
}

/**
 * Circuit breaker pattern for repeated failures
 */
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private isOpen = false
  
  constructor(
    private maxFailures = 5,
    private resetTimeoutMs = 30000 // 30 seconds
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.isOpen = false
        this.failures = 0
        console.log('Circuit breaker reset')
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await operation()
      this.failures = 0
      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()
      
      if (this.failures >= this.maxFailures) {
        this.isOpen = true
        console.warn('Circuit breaker opened due to repeated failures')
      }
      
      throw error
    }
  }
}

// Global circuit breaker for auth operations
export const authCircuitBreaker = new CircuitBreaker(3, 15000) // 3 failures, 15 second timeout