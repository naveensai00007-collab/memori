import { Router, Response, NextFunction } from 'express';
import { ReminderService } from '../services/reminder.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { ReminderCreateSchema } from '../lib/validators';

const router = Router();

router.use(authenticateToken);

// GET /api/v1/reminders
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const upcomingOnly = req.query.upcoming === 'true';
    const reminders = await ReminderService.listReminders(req.user!.id, upcomingOnly);
    res.json({ reminders });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reminders
router.post(
  '/',
  validateRequest(ReminderCreateSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const reminder = await ReminderService.createReminder(req.user!.id, req.body);
      res.status(201).json({ reminder });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/v1/reminders/:id/acknowledge
router.put('/:id/acknowledge', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminder = await ReminderService.acknowledgeReminder(req.user!.id, req.params.id);
    res.json({ reminder });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/reminders/:id/snooze
router.put('/:id/snooze', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = req.body.days ? Number(req.body.days) : 7;
    const reminder = await ReminderService.snoozeReminder(req.user!.id, req.params.id, days);
    res.json({ reminder });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/reminders/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await ReminderService.deleteReminder(req.user!.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
