import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';

beforeAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany({ where: { userId: { not: null } } });
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Auth API', () => {
  const user = { email: 'test@example.com', name: 'Test User', password: 'password123' };
  let accessToken: string;
  let refreshToken: string;

  it('POST /register - creates user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('POST /register - rejects duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  it('POST /register - validates email format', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...user, email: 'not-an-email' });
    expect(res.status).toBe(422);
  });

  it('POST /login - returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('POST /login - rejects wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('GET /profile - returns user data', async () => {
    const res = await request(app).get('/api/v1/auth/profile').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  });

  it('GET /profile - rejects without token', async () => {
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
  });

  it('POST /refresh - issues new tokens', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('POST /logout - succeeds', async () => {
    const res = await request(app).post('/api/v1/auth/logout').send({ refreshToken });
    expect(res.status).toBe(200);
  });
});
