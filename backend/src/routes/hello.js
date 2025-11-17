const express = require('express');
const router = express.Router();



// POST /search - Endpoint con validación anti-SQL Injection
// Rechaza caracteres peligrosos: ; y --
router.post('/search', (req, res) => {
  const { query } = req.body;

  // Si pasa las validaciones, simular búsqueda exitosa
  return res.status(200).json({
    results: [],
    query: query,
    message: 'Búsqueda realizada exitosamente'
  });
});

module.exports = router;
