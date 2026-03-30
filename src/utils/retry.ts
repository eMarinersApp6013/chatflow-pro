// retry — exponential backoff wrapper for API calls.
// Usage: await withRetry(() => chatService.getMessages(id), 3, 1000)

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if error is likely a network error (no internet)
export function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('failed to fetch') ||
      msg.includes('connection') ||
      msg.includes('abort')
    );
  }
  return false;
}
