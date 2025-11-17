// Test de seguridad: SIMU-SQLInjection
// Validar que la API rechace caracteres peligrosos para SQL Injection
// Siguiendo TDD: Rojo -> Verde -> Refactor

const request = require('supertest');
const express = require('express');
const helloRouter = require('../../src/routes/hello');

describe('SIMU-SQLInjection: Prevención de SQL Injection', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', helloRouter);
  });

  test('❌ DEBE RECHAZAR: Texto con punto y coma (;)', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: 'SELECT * FROM users; DROP TABLE users;' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/caracter.*peligroso|no permitido|sql.*injection/i);
  });

  test('❌ DEBE RECHAZAR: Texto con comentario SQL (--)', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: "admin' OR '1'='1' --" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/caracter.*peligroso|no permitido|sql.*injection/i);
  });

  test('❌ DEBE RECHAZAR: Múltiples caracteres peligrosos', async () => {
    const dangerousInputs = [
      'test; DELETE FROM users;',
      "admin'--",
      'user; -- comment',
      "'; DROP TABLE--"
    ];

    for (const input of dangerousInputs) {
      const response = await request(app)
        .post('/api/search')
        .send({ query: input });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    }
  });

  test('✅ DEBE PERMITIR: Texto seguro sin caracteres peligrosos', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: 'usuario123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
  });

  test('✅ DEBE PERMITIR: Texto con caracteres especiales seguros', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: 'user@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
  });

  test('❌ DEBE RECHAZAR: Query vacía', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: '' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
