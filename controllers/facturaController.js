
const { getConnection } = require("../db/database");

const getFactura = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const connection = await getConnection();

        const result = await connection.execute(
            `SELECT 
                F.ID_FACTURA,
                F.FECHA,
                F.CODIGO_FACTURA
            FROM TBL_FACTURACION F
            INNER JOIN USUARIOS A
                ON F.ID_USUARIO = A.ID_USUARIO
            WHERE F.ID_USUARIO = :id_usuario`,
            { id_usuario }
        );

        // Transformar filas a formato JSON
        const facturas = result.rows.map((row) => ({
            ID_FACTURA: row[0],
            FECHA: row[1],
            CODIGO_FACTURA: row[2]
        }));

        // Enviar la respuesta con las facturas
        res.json({ facturas });
    } catch (err) {
        console.error("Error al obtener factura:", err);
        res.status(500).json({ error: "Error al obtener factura" });
    }
};
