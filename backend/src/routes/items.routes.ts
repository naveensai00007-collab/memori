import { Router, Response, NextFunction } from 'express';
import { ItemService } from '../services/item.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { ItemCreateSchema, ItemUpdateSchema } from '../lib/validators';

const router = Router();

router.use(authenticateToken);

// GET /api/v1/items/stats - Life Map completeness statistics
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await ItemService.getStats(req.user!.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/items - List & filter items
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await ItemService.listItems(req.user!.id, req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/items/:id - Get single item
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await ItemService.getItemById(req.user!.id, req.params.id);
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/items - Create item
router.post(
  '/',
  validateRequest(ItemCreateSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await ItemService.createItem(req.user!.id, req.body);
      res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/v1/items/:id - Update item
router.put(
  '/:id',
  validateRequest(ItemUpdateSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await ItemService.updateItem(req.user!.id, req.params.id, req.body);
      res.json({ item });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/items/:id/review - Mark reviewed
router.post('/:id/review', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await ItemService.markReviewed(req.user!.id, req.params.id);
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/items/:id - Delete item
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await ItemService.deleteItem(req.user!.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
