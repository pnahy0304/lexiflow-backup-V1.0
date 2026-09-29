// ============================================================
// CORS Middleware
// ============================================================

import type { Context, Next } from 'hono';

/** Standard CORS headers for the LexiFlow API */
export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Hono middleware that adds CORS headers to every response.
 */
export async function corsMiddleware(c: Context, next: Next) {
  // Handle preflight OPTIONS requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  await next();

  // Add CORS headers to the response
  const headers = corsHeaders();
  for (const [key, value] of Object.entries(headers)) {
    c.res.headers.set(key, value);
  }
}
