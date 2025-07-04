export function isUnauthorizedError(error: Error): boolean {
  // Check for specific messages from server/utils/errorHandler.ts for 401 errors
  return error.message.includes('Not authorized, no token') || error.message.includes('Not authorized, token failed') || error.message.includes('Not authorized, token expired');
}
