import { Router, Response, NextFunction } from 'express';
import { LocationService } from '../services/location.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { LocationCreateSchema } from '../lib/validators';

const router = Router();

router.use(authenticateToken);

// GET /api/v1/locations
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const locations = await LocationService.listLocations(req.user!.id);
    res.json({ locations });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/locations
router.post(
  '/',
  validateRequest(LocationCreateSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const location = await LocationService.createLocation(req.user!.id, req.body);
      res.status(201).json({ location });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/v1/locations/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const location = await LocationService.updateLocation(req.user!.id, req.params.id, req.body);
    res.json({ location });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/locations/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await LocationService.deleteLocation(req.user!.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
