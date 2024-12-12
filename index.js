const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getConnection } = require("./db/database");

// Importar las rutas
const authRoutes = require("./routes/auth");
const productosRoutes = require("./routes/productos");
const carritoRoutes = require("./routes/carrito");
const cardRouter = require("./routes/cards");


const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Ruta para probar la conexión a la base de datos
app.get("/api/usuarios", async (req, res) => {
  let connection;

  try {
    // Obtener conexión a la base de datos
    connection = await getConnection();

    // Ejecutar una consulta simple
    const result = await connection.execute("SELECT * FROM USUARIOS");

    // Transformar a formato JSON
    const data = result.rows.map((row) => {
      return result.metaData.reduce((obj, meta, index) => {
        obj[meta.name] = row[index];
        return obj;
      }, {});
    });

    // Devolver como JSON
    res.json({ data });
  } catch (err) {
    console.error("Error al realizar la consulta:", err);
    res.status(500).json({ error: "No se pudo conectar a la base de datos" });
  }
});

// Rutas principales
app.use("/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/card", cardRouter);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente.");
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} xd`);
});




//const port = process.env.PORT || 3000,
//express = require('express'),
//app = express();

//app.listen(port, () => {
    //console.log(`Servidor levantado en el puerto: ${port}`);
//});