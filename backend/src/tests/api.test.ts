import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import prisma from '../config/database';

const app = createApp();

describe('MEMORI Backend API Integration Tests', () => {
  let authToken = '';
  let userId = '';
  let itemId = '';
  let locationId = '';
  let reminderId = '';

  const testEmail = `test_${Date.now()}@memori.app`;
  const testPassword = 'MasterPassword123!';

  beforeAll(async () => {
    // Ensure clean test user
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  it('GET /health should return 200 with service status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('memori-backend');
  });

  it('POST /api/v1/auth/register should create user and return JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        master_password: testPassword,
        encryption_salt: 'dGVzdC1zYWx0LTMyLWJ5dGVzLWJhc2U2NC1leGFtcGxl',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.encryption_salt).toBeDefined();
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  it('POST /api/v1/auth/login should authenticate user and issue token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        master_password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.id).toBe(userId);
  });

  it('POST /api/v1/locations should create a vault location', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Master Bedroom Safe',
        type: 'physical',
        address: '2nd Floor Home Office, Top Shelf',
        description: 'Key is in the desk drawer',
      });

    expect(res.status).toBe(201);
    expect(res.body.location.name).toBe('Master Bedroom Safe');
    locationId = res.body.location.id;
  });

  it('POST /api/v1/items should create an item with encrypted sensitive data', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Indian Passport',
        category: 'identity',
        subcategory: 'Passport',
        status: 'complete',
        description: 'Original passport issued in Bangalore',
        tags: ['travel', 'official', 'govt'],
        physical_location: 'Master Safe Shelf 1',
        location_id: locationId,
        expiry_date: '2032-05-15',
        reminder_date: '2032-04-15',
        sensitive_data: 'AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA=', // Base64 mock ciphertext
      });

    expect(res.status).toBe(201);
    expect(res.body.item.title).toBe('Indian Passport');
    expect(res.body.item.sensitive_data).toBe('AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA=');
    expect(res.body.item.tags).toEqual(['travel', 'official', 'govt']);
    itemId = res.body.item.id;
  });

  it('GET /api/v1/items should list items with category filter and search', async () => {
    const res = await request(app)
      .get('/api/v1/items?category=identity&search=Passport')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].title).toBe('Indian Passport');
  });

  it('GET /api/v1/items/stats should calculate Life Map completeness metrics', async () => {
    const res = await request(app)
      .get('/api/v1/items/stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total_items).toBeGreaterThanOrEqual(1);
    expect(res.body.completeness_percentage).toBeGreaterThanOrEqual(0);
    expect(res.body.category_breakdown.identity.total).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/items/:id/review should mark item reviewed and update timestamp', async () => {
    const res = await request(app)
      .post(`/api/v1/items/${itemId}/review`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.item.last_reviewed_at).toBeDefined();
  });

  it('POST /api/v1/reminders should create a reminder', async () => {
    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        item_id: itemId,
        type: 'expiry',
        scheduled_date: '2032-04-15',
      });

    expect(res.status).toBe(201);
    expect(res.body.reminder.item_id).toBe(itemId);
    reminderId = res.body.reminder.id;
  });

  it('PUT /api/v1/reminders/:id/acknowledge should acknowledge reminder', async () => {
    const res = await request(app)
      .put(`/api/v1/reminders/${reminderId}/acknowledge`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.reminder.acknowledged).toBe(true);
  });

  it('POST /api/v1/sync/pull should pull delta changes for offline cache', async () => {
    const res = await request(app)
      .get('/api/v1/sync/pull')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.locations.length).toBeGreaterThanOrEqual(1);
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/users/me/export should export user data in structured JSON', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/export')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.locations.length).toBeGreaterThanOrEqual(1);
  });
});
