const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta";

// Registro de usuarios
async function register(req, res) {
    const { nombre, correo_electronico, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await getConnection();
    try {
        const query = `
            INSERT INTO usuarios (nombre, correo_electronico, password, fecha_registro)
            VALUES (:nombre, :correo, :password, SYSDATE)
        `;
        await connection.execute(query, {
            nombre,
            correo: correo_electronico,
            password: hashedPassword,
        }, { autoCommit: true });

        res.status(201).send("Usuario registrado con éxito");
    } catch (err) {
        console.error("Error al registrar usuario:", err);
        res.status(500).send("Error al registrar usuario");
    } finally {
        await connection.close();
    }
}

// Inicio de sesión
async function login(req, res) {
    const { correo_electronico, password } = req.body;

    if (!correo_electronico || !password) {
        return res.status(400).send("Correo electrónico y contraseña son obligatorios");
    }

    const connection = await getConnection();
    try {
        const query = `
            SELECT id_usuario, password
            FROM usuarios
            WHERE correo_electronico = :correo
        `;
        const result = await connection.execute(query, { correo: correo_electronico });

        if (result.rows.length === 0) {
            return res.status(401).send("Usuario no encontrado");
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user[1]);

        if (!passwordMatch) {
            return res.status(401).send("Contraseña incorrecta");
        }

        const token = jwt.sign({ id_usuario: user[0], email: correo_electronico }, JWT_SECRET, { expiresIn: "1h" });

        // Respuesta enriquecida con más información
        res.json({
            token,
            user: {
                id: user[0],
                email: correo_electronico
            },
            message: "Inicio de sesión exitoso"
        });
    } catch (err) {
        console.error("Error al iniciar sesión:", err);
        res.status(500).send("Error al iniciar sesión");
    } finally {
        await connection.close();
    }
}

module.exports = { register, login };
