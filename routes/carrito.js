const express = require("express");
const { addToCart, getCart, deleteCartItem } = require("../controllers/carritoController");

const router = express.Router();

// Ruta para agregar un producto al carrito
router.post("/", addToCart);

// Ruta para obtener el contenido del carrito
router.get("/:id_usuario", getCart);

// Ruta para eliminar un producto del carrito
router.delete("/:id_carrito_product", deleteCartItem);

module.exports = router;
