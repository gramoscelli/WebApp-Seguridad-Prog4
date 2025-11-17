// Test de integración para endpoint simple GET /api/hello
// Siguiendo TDD: Rojo -> Verde -> Refactor

const request = require('supertest');
const express = require('express');
const helloRouter = require('../../src/routes/hello');

describe('GET /api/hello - endpoint simple', () => {
  let app;

  // Configuración de la app para testing
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', helloRouter);
  });

  it('debería responder 200 con mensaje "Hello World"', async () => {
    const res = await request(app).get('/api/hello');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Hello World');
  });

  it('debería responder con Content-Type application/json', async () => {
    const res = await request(app).get('/api/hello');

    expect(res.headers['content-type']).toMatch(/json/);
  });
});
