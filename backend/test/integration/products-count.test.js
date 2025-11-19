// Test de integración para endpoint GET /api/products/count
// Siguiendo TDD: Rojo -> Verde -> Refactor

const request = require('supertest');
const express = require('express');
const productRoutes = require('../../src/routes/products');

describe('GET /api/products/count - conteo de productos', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', productRoutes);
  });

  it('debería responder 200 con el conteo total de productos', async () => {
    const res = await request(app).get('/api/products/count');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
    expect(typeof res.body.count).toBe('number');
  });

  it('debería devolver un número mayor o igual a cero', async () => {
    const res = await request(app).get('/api/products/count');

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(0);
  });

  it('debería responder con Content-Type application/json', async () => {
    const res = await request(app).get('/api/products/count');

    expect(res.headers['content-type']).toMatch(/json/);
  });
});
