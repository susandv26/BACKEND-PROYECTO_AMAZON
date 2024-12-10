const { getConnection } = require("../db/database");

// Agregar un producto al carrito

const addToCart = async (req, res) => {
    const { id_usuario, id_producto, cantidad, precio_unitario } = req.body;

    if (!id_usuario || !id_producto || !cantidad || !precio_unitario) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const connection = await getConnection();

        // Crear siempre un nuevo carrito para cada producto
        await connection.execute(
            `INSERT INTO CARRITOS (ID_CARRITO, ID_USUARIO, FECHA_CREACION)
            VALUES (CARRITOS_SEQ.NEXTVAL, :id_usuario, SYSDATE)`,
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
            VALUES (CAR_X_PRODUCTOS_SEQ.NEXTVAL, :id_carrito, :id_producto, :cantidad, :precio_unitario)`,
            { id_carrito, id_producto, cantidad, precio_unitario },
            { autoCommit: true }
        );

        res.status(201).json({ message: "Producto agregado al carrito con éxito" });
    } catch (err) {
        console.error("Error al agregar producto al carrito:", err);
        res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
};


/*// obtener el contenido del carrito
const getCart = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const connection = await getConnection();
        const result = await connection.execute(
            `SELECT 
                a.ID_CARRITO_PRODUCT,
                p.NOMBRE_PRODUCTO AS nombre_producto,
                a.CANTIDAD AS cantidad,
                a.PRECIO_UNITARIO AS precio_unitario,
                (c.CANTIDAD * c.PRECIO_UNITARIO) AS total
                FROM CAR_X_PRODUCTOS a
                JOIN PRODUCTOS p ON a.ID_PRODUCTO = p.ID_PRODUCTO
                WHERE a.ID_CARRITO = (SELECT ID_CARRITO FROM CARRITOS WHERE ID_USUARIO = :id_usuario)`,
            { id_usuario },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({ carrito: result.rows });
    } catch (err) {
        console.error("Error al obtener el carrito:", err);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
};

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
};*/

module.exports = { addToCart, /*getCart,deleteCartItem*/};

