// Test de seguridad: Rate Limiting para login de admin
// Siguiendo TDD: Rojo -> Verde -> Refactor

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const { clearLoginAttempts } = require('../../src/controllers/authController');

describe('SEGURIDAD: Rate Limiting para admin', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', authRoutes);
  });

  afterEach(() => {
    // Limpiar intentos de login entre tests
    clearLoginAttempts();
  });

  it('❌ DEBE RECHAZAR: Más de 3 intentos de login fallidos para admin', async () => {
    const wrongCredentials = {
      username: 'admin',
      password: 'wrongpassword'
    };

    // Realizar 3 intentos fallidos
    await request(app).post('/api/login').send(wrongCredentials);
    await request(app).post('/api/login').send(wrongCredentials);
    await request(app).post('/api/login').send(wrongCredentials);

    // El 4to intento debe ser bloqueado
    const res = await request(app).post('/api/login').send(wrongCredentials);

    expect(res.status).toBe(429); // Too Many Requests
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/bloqueado|intentos|rate limit/i);
  });

  it('❌ DEBE RECHAZAR: Incluir tiempo de espera en respuesta de bloqueo', async () => {
    const wrongCredentials = {
      username: 'admin',
      password: 'wrongpassword'
    };

    // Realizar 3 intentos fallidos
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/login').send(wrongCredentials);
    }

    // El 4to intento debe incluir información de tiempo de espera
    const res = await request(app).post('/api/login').send(wrongCredentials);

    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty('retryAfter');
    expect(res.body.retryAfter).toBeGreaterThan(0);
  });

  it('✅ DEBE PERMITIR: Menos de 3 intentos fallidos no bloquea (recibe 401, no 429)', async () => {
    const wrongCredentials = {
      username: 'admin',
      password: 'wrongpassword'
    };

    // 2 intentos fallidos (menos del límite)
    await request(app).post('/api/login').send(wrongCredentials);
    await request(app).post('/api/login').send(wrongCredentials);

    // 3er intento también fallido, pero no debe ser bloqueado con 429
    const res = await request(app).post('/api/login').send(wrongCredentials);

    // Debe recibir 401 (credenciales inválidas), NO 429 (bloqueado)
    expect(res.status).toBe(401);
    expect(res.status).not.toBe(429);
    expect(res.body.error).toMatch(/credenciales|inválidas/i);
  });

  it('✅ DEBE PERMITIR: Usuarios que no son admin no tienen rate limit', async () => {
    const wrongCredentials = {
      username: 'user1',
      password: 'wrongpassword'
    };

    // Realizar 5 intentos fallidos para user1 (más del límite de admin)
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/login').send(wrongCredentials);
      // No debe ser bloqueado con 429
      expect(res.status).not.toBe(429);
    }
  });
});
