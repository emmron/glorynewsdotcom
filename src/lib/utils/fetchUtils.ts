/**
 * Utility for fetching with exponential backoff retry logic
 */

interface RetryOptions {
  retries: number;
  initialDelay: number;
  maxDelay: number;
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { retries, initialDelay, maxDelay } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If we've exhausted all retries, throw the error
      if (attempt >= retries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );

      console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed after maximum retries');
}
