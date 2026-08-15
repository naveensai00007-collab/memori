import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { validateRequest } from '../middleware/validation';
import { RegisterSchema, LoginSchema } from '../lib/validators';
import { authRateLimiter } from '../middleware/rateLimit';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  authRateLimiter,
  validateRequest(RegisterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, master_password, encryption_salt } = req.body;
      const result = await AuthService.register(email, master_password, encryption_salt);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authRateLimiter,
  validateRequest(LoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, master_password } = req.body;
      const result = await AuthService.login(email, master_password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Refresh token is required.' } });
      }
      const result = await AuthService.refreshToken(refresh_token);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/auth/me
router.get(
  '/me',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.getProfile(req.user!.id);
      res.json({ user: result });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  authenticateToken,
  async (_req: AuthRequest, res: Response) => {
    res.json({ success: true, message: 'Logged out successfully.' });
  }
);

export default router;
