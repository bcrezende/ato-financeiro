import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';

let accessToken: string;
let categoryId: string;
let transactionId: string;

beforeAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany({ where: { userId: { not: null } } });
  await prisma.user.deleteMany();

  const reg = await request(app).post('/api/v1/auth/register').send({
    email: 'tx@example.com', name: 'TX User', password: 'password123',
  });
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'tx@example.com', password: 'password123' });
  accessToken = login.body.data.accessToken;

  const catRes = await request(app).post('/api/v1/categories')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'Test Cat', color: '#ff0000', icon: 'tag', type: 'EXPENSE' });
  categoryId = catRes.body.data.id;
});

afterAll(() => prisma.$disconnect());

describe('Transaction API', () => {
  it('POST / - creates transaction', async () => {
    const res = await request(app).post('/api/v1/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Grocery run',
        amount: 150.50,
        type: 'EXPENSE',
        date: new Date().toISOString(),
        categoryId,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.description).toBe('Grocery run');
    expect(res.body.data.category).toBeDefined();
    transactionId = res.body.data.id;
  });

  it('POST / - validates required fields', async () => {
    const res = await request(app).post('/api/v1/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'Bad' });
    expect(res.status).toBe(422);
  });

  it('GET / - returns paginated list', async () => {
    const res = await request(app).get('/api/v1/transactions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /:id - returns transaction', async () => {
    const res = await request(app).get(`/api/v1/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(transactionId);
  });

  it('PUT /:id - updates transaction', async () => {
    const res = await request(app).put(`/api/v1/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'Updated grocery' });
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated grocery');
  });

  it('GET /summary - returns monthly summary', async () => {
    const res = await request(app).get('/api/v1/transactions/summary')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('income');
    expect(res.body.data).toHaveProperty('expense');
    expect(res.body.data).toHaveProperty('balance');
  });

  it('DELETE /:id - deletes transaction', async () => {
    const res = await request(app).delete(`/api/v1/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});
