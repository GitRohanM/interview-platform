const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

// ── Test user credentials
const testUser = {
  name: 'Test User',
  email: 'test@interviewai.com',
  password: 'Test@123',
  role: 'Frontend Developer',
};

let accessToken;
let sessionId;

beforeAll(async () => {
  // Connect to test DB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai_test');
  await User.deleteMany({ email: testUser.email });
});

afterAll(async () => {
  await User.deleteMany({ email: testUser.email });
  await mongoose.connection.close();
});

// ── Auth Tests
describe('AUTH ENDPOINTS', () => {
  test('POST /api/auth/register — should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined(); // Password never returned
    accessToken = res.body.accessToken;
  });

  test('POST /api/auth/register — should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/login — should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  test('POST /api/auth/login — should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me — should return current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('GET /api/auth/me — should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

// ── Questions Tests
describe('QUESTION ENDPOINTS', () => {
  test('GET /api/questions — should return questions list', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.questions)).toBe(true);
  });

  test('GET /api/questions?role=Frontend Developer — should filter by role', async () => {
    const res = await request(app)
      .get('/api/questions?role=Frontend Developer')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
  });
});

// ── Interview Tests
describe('INTERVIEW ENDPOINTS', () => {
  test('POST /api/interviews/start — should create session', async () => {
    const res = await request(app)
      .post('/api/interviews/start')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ role: 'Frontend Developer', difficulty: 'Easy', count: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.questions.length).toBeGreaterThan(0);
    sessionId = res.body.sessionId;
  });

  test('GET /api/interviews/sessions — should list user sessions', async () => {
    const res = await request(app)
      .get('/api/interviews/sessions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.sessions)).toBe(true);
  });
});

// ── Health Check
describe('HEALTH CHECK', () => {
  test('GET /api/health — should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
