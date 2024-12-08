const { getConnection } = require("../db/database");

// Controlador para obtener todos los productos con información combinada
const getProductos = async (req, res) => {
    let connection;
  
    try {
      connection = await getConnection();
  
      console.log("Ejecutando consulta SQL...");
  
      const result = await connection.execute(`
        SELECT 
          p.ID_PRODUCTO,
          p.NOMBRE_PRODUCTO AS titulo,
          p.DESCRIPCION AS descripcion,
          p.PRECIO AS precioActual,
          img.URL_IMAGEN AS imagen,
          NVL(d.PORCENTAJE_DESCUENTO, 0) AS descuento,
          pr.PRECIO AS precioAnterior
        FROM PRODUCTOS p
        LEFT JOIN IMAGE_PRODUCTOS img ON p.ID_IMAGEN = img.ID_IMAGEN
        LEFT JOIN DESCUENTOS d ON p.ID_PRODUCTO = d.ID_PRODUCTO
        LEFT JOIN PRECIOS pr ON p.ID_PRODUCTO = pr.ID_PRODUCTO AND pr.FECHA_FIN IS NOT NULL
      `);
  
      console.log("Resultado de la consulta:", result.rows);
  
      const productos = result.rows.map((row) => {
        return result.metaData.reduce((obj, meta, index) => {
          obj[meta.name.toLowerCase()] = row[index];
          return obj;
        }, {});
      });
  
      console.log("Productos transformados:", productos);
  
      res.json({ productos });
    } catch (err) {
      console.error("Error al obtener productos:", err);
      res.status(500).json({ error: "Error al obtener productos" });
    }
  };

// Controlador para agregar un nuevo producto
const addProducto = async (req, res) => {
  let connection;

  try {
    // Obtener conexión a la base de datos
    connection = await getConnection();

    const { nombre_producto, descripcion, precio, id_marca, id_imagen } = req.body;

    // Validar datos
    if (!nombre_producto || !descripcion || !precio || !id_marca || !id_imagen) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Insertar producto en la base de datos
    const result = await connection.execute(
      "INSERT INTO PRODUCTOS (NOMBRE_PRODUCTO, DESCRIPCION, PRECIO, ID_MARCA, ID_IMAGEN) VALUES (:nombre_producto, :descripcion, :precio, :id_marca, :id_imagen)",
      { nombre_producto, descripcion, precio, id_marca, id_imagen }
    );

    res.status(201).json({ message: "Producto agregado correctamente", result });
  } catch (err) {
    console.error("Error al agregar producto:", err);
    res.status(500).json({ error: "Error al agregar producto" });
  }
};

module.exports = { getProductos, addProducto };
