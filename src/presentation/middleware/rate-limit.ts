import { Request, Response, NextFunction } from 'express';

interface WindowState { count: number; resetAt: number; }

export function createRateLimiter(options: { windowMs: number; max: number; keyGenerator?: (req: Request) => string }) {
  const store = new Map<string, WindowState>();
  const { windowMs, max } = options;
  const keyGen = options.keyGenerator || ((req: Request) => req.ip || 'global');

  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const key = keyGen(req) + '|' + req.path;
    const now = Date.now();
    const state = store.get(key);
    if (!state || state.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (state.count < max) {
      state.count += 1;
      return next();
    }
    const retryAfterSec = Math.ceil((state.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfterSec));
    res.status(429).json({ error: { message: 'Too many requests', statusCode: 429 } });
  };
}


