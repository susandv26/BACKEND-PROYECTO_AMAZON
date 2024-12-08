const oracledb = require("oracledb");

// Configuración de la conexión a la base de datos
const dbConfig = {
  user: "C##AMAZON_BD",
  password: "oracle",
  connectString: 'localhost:1521/xe'
};

// Función para obtener una conexión
async function getConnection() {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log("Conexión exitosa a la base de datos");
        return connection;
    } catch (err) {
        console.error("Error al conectar a la base de datos:", err);
        throw err;
    }
}

// Función para cerrar una conexión
async function closeConnection(connection) {
    try {
        await connection.close();
        console.log("Conexión cerrada correctamente");
    } catch (err) {
        console.error("Error al cerrar la conexión:", err);
    }
}

module.exports = { getConnection, closeConnection };
