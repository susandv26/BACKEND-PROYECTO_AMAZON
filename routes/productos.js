
const express = require("express");
const { getProductos, addProducto } = require("../controllers/productosController");

const router = express.Router();

// Ruta para obtener todos los productos
router.get("/", getProductos);

// Ruta para agregar un nuevo producto
router.post("/", addProducto);

module.exports = router;
