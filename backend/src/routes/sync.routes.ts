import { Router, Response, NextFunction } from 'express';
import { SyncService } from '../services/sync.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// POST /api/v1/sync/push
router.post('/push', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const operations = req.body.operations || [];
    const result = await SyncService.pushOperations(req.user!.id, operations);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sync/pull
router.get('/pull', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const since = req.query.since as string | undefined;
    const result = await SyncService.pullChanges(req.user!.id, since);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
