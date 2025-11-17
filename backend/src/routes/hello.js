const express = require('express');
const router = express.Router();

// GET /hello - Endpoint simple que retorna "Hello World"
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

// POST /search - Endpoint con validación anti-SQL Injection
// Rechaza caracteres peligrosos: ; y --
router.post('/search', (req, res) => {
  const { query } = req.body;

  // Validación 1: Query no puede estar vacía
  if (!query || query.trim() === '') {
    return res.status(400).json({
      error: 'Query no puede estar vacía'
    });
  }

  // Validación 2: Detectar caracteres peligrosos para SQL Injection
  const dangerousPatterns = [';', '--'];

  for (const pattern of dangerousPatterns) {
    if (query.includes(pattern)) {
      return res.status(400).json({
        error: 'Caracter peligroso detectado. No se permiten ; ni -- para prevenir SQL Injection'
      });
    }
  }

  // Si pasa las validaciones, simular búsqueda exitosa
  return res.status(200).json({
    results: [],
    query: query,
    message: 'Búsqueda realizada exitosamente'
  });
});

module.exports = router;
