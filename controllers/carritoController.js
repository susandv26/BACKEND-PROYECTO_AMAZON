const { getConnection } = require("../db/database");

// Agregar un producto al carrito

const addToCart = async (req, res) => {
    const { id_usuario, id_producto, cantidad, precio_unitario } = req.body;

    if (!id_usuario || !id_producto || !cantidad || !precio_unitario) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const connection = await getConnection();

        // Verificar si existe un carrito para el usuario
        let resultCarrito = await connection.execute(
            `SELECT ID_CARRITO FROM CARRITOS WHERE ID_USUARIO = :id_usuario`,
            { id_usuario }
        );

        let id_carrito;

        if (resultCarrito.rows.length === 0) {
            // Crear un nuevo carrito si no existe
            await connection.execute(
                `INSERT INTO CARRITOS (ID_CARRITO, ID_USUARIO, FECHA_CREACION)
                VALUES (SEQ_CARRITOS.NEXTVAL, :id_usuario, SYSDATE)`,
                { id_usuario },
                { autoCommit: true }
            );

            // Obtener el ID del carrito recién creado
            const resultNewCarrito = await connection.execute(
                `SELECT ID_CARRITO FROM CARRITOS WHERE ID_USUARIO = :id_usuario ORDER BY FECHA_CREACION DESC FETCH FIRST 1 ROWS ONLY`,
                { id_usuario }
            );

            id_carrito = resultNewCarrito.rows[0][0]; // Obtener el ID del carrito
        } else {
            // Si ya existe, obtén el ID_CARRITO
            id_carrito = resultCarrito.rows[0][0];
        }

        // Verificar si el producto ya está en el carrito
        const resultProducto = await connection.execute(
            `SELECT ID_CARRITO_PRODUCT, CANTIDAD FROM CAR_X_PRODUCTOS
             WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto`,
            { id_carrito, id_producto }
        );

        if (resultProducto.rows.length > 0) {
            // Producto ya existe en el carrito, actualizamos la cantidad
            const cantidadExistente = resultProducto.rows[0][1];
            const nuevaCantidad = cantidadExistente + cantidad;

            await connection.execute(
                `UPDATE CAR_X_PRODUCTOS
                 SET CANTIDAD = :nuevaCantidad
                 WHERE ID_CARRITO_PRODUCT = :id_carrito_product`,
                {
                    nuevaCantidad,
                    id_carrito_product: resultProducto.rows[0][0],
                },
                { autoCommit: true }
            );
        } else {
            // Producto no está en el carrito, lo agregamos
            await connection.execute(
                `INSERT INTO CAR_X_PRODUCTOS (ID_CARRITO_PRODUCT, ID_CARRITO, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
                VALUES (SEQ_CAR_X_PRODUCTOS.NEXTVAL, :id_carrito, :id_producto, :cantidad, :precio_unitario)`,
                { id_carrito, id_producto, cantidad, precio_unitario },
                { autoCommit: true }
            );
        }

        res.status(201).json({ message: "Producto agregado al carrito con éxito" });
    } catch (err) {
        console.error("Error al agregar producto al carrito:", err);
        res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
};


/*const addToCart = async (req, res) => {
    const { id_usuario, id_producto, cantidad, precio_unitario } = req.body;

    if (!id_usuario || !id_producto || !cantidad || !precio_unitario) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const connection = await getConnection();

        // Crear siempre un nuevo carrito para cada producto
        await connection.execute(
            `INSERT INTO CARRITOS (ID_CARRITO, ID_USUARIO, FECHA_CREACION)
            VALUES (SEQ_CARRITOS.NEXTVAL, :id_usuario, SYSDATE)`,
            { id_usuario },
            { autoCommit: true }
        );

        // Recuperar el ID del carrito recién creado
        const resultNewCarrito = await connection.execute(
            `SELECT ID_CARRITO FROM CARRITOS 
            WHERE ID_USUARIO = :id_usuario 
            ORDER BY FECHA_CREACION DESC FETCH FIRST 1 ROWS ONLY`,
            { id_usuario }
        );

        const id_carrito = resultNewCarrito.rows[0][0]; // Obtener el ID del carrito

        // Insertar el producto en el nuevo carrito
        await connection.execute(
            `INSERT INTO CAR_X_PRODUCTOS (ID_CARRITO_PRODUCT, ID_CARRITO, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
            VALUES (seq_car_x_productos.NEXTVAL, :id_carrito, :id_producto, :cantidad, :precio_unitario)`,
            { id_carrito, id_producto, cantidad, precio_unitario },
            { autoCommit: true }
        );

        res.status(201).json({ message: "Producto agregado al carrito con éxito" });
    } catch (err) {
        console.error("Error al agregar producto al carrito:", err);
        res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
};*/


// Obtener el contenido del carrito por ID de usuario
const getCart = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const connection = await getConnection();

        // Consulta para obtener todos los productos del carrito del usuario
        const result = await connection.execute(
            `SELECT 
                c.ID_CARRITO_PRODUCT,
                p.NOMBRE_PRODUCTO AS nombre_producto,
                c.PRECIO_UNITARIO AS precio_unitario,
                c.CANTIDAD AS cantidad,
                img.URL_IMAGEN AS imagen,
                (c.CANTIDAD * c.PRECIO_UNITARIO) AS total
             FROM CAR_X_PRODUCTOS c
             JOIN PRODUCTOS p ON c.ID_PRODUCTO = p.ID_PRODUCTO
             LEFT JOIN IMAGE_PRODUCTOS img ON p.ID_IMAGEN = img.ID_IMAGEN
             WHERE c.ID_CARRITO = (
                SELECT ID_CARRITO FROM CARRITOS WHERE ID_USUARIO = :id_usuario
             )`,
            { id_usuario }
        );

        // Transformar filas a formato JSON
        const carrito = result.rows.map((row) => ({
            id_carrito_product: row[0],
            nombre_producto: row[1],
            precio_unitario: row[2],
            cantidad: row[3],
            imagen: row[4],
            total: row[5],
        }));

        res.json({ carrito });
    } catch (err) {
        console.error("Error al obtener el carrito:", err);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
};


// Eliminar un producto del carrito por ID
/*const deleteCartItem = async (req, res) => {
  const { id_carrito_product } = req.params;

  try {
    const connection = await getConnection();
    await connection.execute(
      `DELETE FROM CAR_X_PRODUCTOS WHERE ID_CARRITO_PRODUCT = :id_carrito_product`,
      { id_carrito_product },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Producto eliminado del carrito con éxito" });
  } catch (err) {
    console.error("Error al eliminar producto del carrito:", err);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
}*/



//eliminar un carrito
const deleteCartItem = async (req, res) => {
    const { id_carrito_product } = req.params;

    try {
        const connection = await getConnection();
        await connection.execute(
            `DELETE FROM CAR_X_PRODUCTOS WHERE ID_CARRITO_PRODUCT = :id_carrito_product`,
            { id_carrito_product },
            { autoCommit: true }
        );

        res.status(200).json({ message: "Producto eliminado del carrito con éxito" });
    } catch (err) {
        console.error("Error al eliminar producto del carrito:", err);
        res.status(500).json({ error: "Error al eliminar producto del carrito" });
    }
};

module.exports = { addToCart, getCart,deleteCartItem};

