import { Router, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { UserSettingsSchema } from '../lib/validators';

const router = Router();

router.use(authenticateToken);

// GET /api/v1/users/me/export - Download full personal data as JSON
router.get('/me/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await AuthService.exportUserData(req.user!.id);
    res.setHeader('Content-Disposition', `attachment; filename="memori-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/users/me/settings - Update settings
router.put(
  '/me/settings',
  validateRequest(UserSettingsSchema.partial()),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await AuthService.updateSettings(req.user!.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/users/me/change-password
router.post('/me/change-password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { old_password, new_password, new_salt } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'Old and new passwords required.' } });
    }
    const result = await AuthService.changePassword(req.user!.id, old_password, new_password, new_salt);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/me/delete-account
router.post('/me/delete-account', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { master_password } = req.body;
    if (!master_password) {
      return res.status(400).json({ error: { code: 'MISSING_PASSWORD', message: 'Master password required for deletion.' } });
    }
    const result = await AuthService.deleteAccount(req.user!.id, master_password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
