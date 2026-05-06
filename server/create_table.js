require('dotenv').config();
const mysql = require('mysql2/promise');

async function createUsuariosTable() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

    try {
        const db = await mysql.createPool(dbConfig);
        console.log('Conectado a la base de datos.');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                verification_token VARCHAR(255),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await db.execute(createTableQuery);
        console.log('Tabla "usuarios" creada o ya existía.');
        process.exit(0);
    } catch (error) {
        console.error('Error creando tabla usuarios:', error.message);
        process.exit(1);
    }
}

createUsuariosTable();
