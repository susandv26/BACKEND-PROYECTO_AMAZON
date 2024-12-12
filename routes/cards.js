const express = require("express");
const { insertCard, getAllCards, getCardsByUserId } = require("../controllers/cardcontroller");

const router = express.Router();

// Ruta para insertar una nueva tarjeta
router.post("/cards", insertCard);

// Ruta para obtener todas las tarjetas
router.get("/cards", getAllCards);

// Ruta para obtener las tarjetas de un usuario específico
router.get("/cards/user/:userId", getCardsByUserId); 

module.exports = router;
