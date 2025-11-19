const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Ruta para obtener conteo de productos (debe ir antes de /products)
router.get('/products/count', productController.getProductsCount);

// Ruta de productos (vulnerable a SQL injection)
router.get('/products', productController.getProducts);

module.exports = router;
