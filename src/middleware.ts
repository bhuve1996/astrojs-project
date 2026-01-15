import type { MiddlewareHandler } from 'astro';
import { isExcludedPath, isNextJsPath } from './config/site.config';

/**
 * Middleware to intercept and block paths that shouldn't be handled by routes.
 * All path exclusions are driven from site.config.ts
 */
export const onRequest: MiddlewareHandler = (context, next) => {
  const pathname = context.url.pathname;

  // Block Next.js internal paths (from config)
  if (isNextJsPath(pathname)) {
    return new Response('Not Found', { status: 404, statusText: 'Not Found' });
  }

  // Block excluded paths (static assets, etc. from config)
  if (isExcludedPath(pathname)) {
    return new Response('Not Found', { status: 404, statusText: 'Not Found' });
  }

  return next();
};
