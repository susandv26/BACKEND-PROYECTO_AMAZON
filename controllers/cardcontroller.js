const { getConnection, closeConnection } = require("../db/database");

// Método para obtener todas las tarjetas
const getAllCards = async (req, res) => {
    let connection;

    try {
        connection = await getConnection(); // Obtener la conexión

        // Consulta SQL para obtener todos los registros
        const query = "SELECT * FROM CARDS";

        // Ejecutar la consulta
        const result = await connection.execute(query);

        // result.rows contendrá los registros obtenidos
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error al obtener las tarjetas:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    } finally {
        if (connection) {
            await closeConnection(connection); // Cerrar la conexión
        }
    }
};

// Método para insertar una nueva tarjeta
const insertCard = async (req, res) => {
    const { titular, numeroTarjeta, fechaVencimiento, cvv, idUsuario } = req.body;

    if (!titular || !numeroTarjeta || !fechaVencimiento || !cvv || !idUsuario) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    let connection;

    try {
        connection = await getConnection();

        const query = `
            INSERT INTO CARDS (ID_TARJETA, TITULAR, NUMERO_TARJETA, FECHA_VENCIMIENTO, CVV, ID_USUARIO)
            VALUES (SEQ_CARDS.NEXTVAL, :titular, :numeroTarjeta, TO_DATE(:fechaVencimiento, 'YYYY-MM-DD'), :cvv, :idUsuario)
        `;

        // Ejecutar la consulta
        await connection.execute(query, {
            titular,
            numeroTarjeta,
            fechaVencimiento,
            cvv,
            idUsuario
        });

        await connection.commit(); // Confirmar la transacción

        return res.status(201).json({ message: "Tarjeta insertada correctamente." });

    } catch (error) {
        console.error("Error al insertar la tarjeta:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    } finally {
        if (connection) {
            await closeConnection(connection);
        }
    }
};

// Método para obtener las tarjetas de un usuario específico
const getCardsByUserId = async (req, res) => {
    const userId = req.params.userId; // Obtener el ID del usuario desde los parámetros de la solicitud
    let connection;

    try {
        connection = await getConnection(); // Obtener la conexión

        // Consulta SQL para obtener las tarjetas del usuario
        const query = "SELECT * FROM CARDS WHERE ID_USUARIO = :userId";

        // Ejecutar la consulta
        const result = await connection.execute(query, { userId });

        // result.rows contendrá los registros obtenidos
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error al obtener las tarjetas del usuario:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    } finally {
        if (connection) {
            await closeConnection(connection); // Cerrar la conexión
        }
    }
};

module.exports = {
    getAllCards,
    insertCard,
    getCardsByUserId
};
