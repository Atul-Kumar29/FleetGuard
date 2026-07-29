const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('returns 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required.');
    });

    it('returns 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'secretpassword' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required.');
    });
  });

  describe('POST /api/auth/signup', () => {
    it('returns 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required.');
    });

    it('returns 400 if password is less than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com', password: '123' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 6 characters long.');
    });

    it('returns 400 if role is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com', password: 'password123', role: 'SUPERHERO' });
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid role');
    });
  });
});
