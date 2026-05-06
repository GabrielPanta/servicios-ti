require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    const dbConfig = {
        host: '127.0.0.1',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

    try {
        const db = await mysql.createPool(dbConfig);
        console.log('Conectado a la base de datos para migración.');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS solicitudes_riesgo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_proyecto VARCHAR(255) NOT NULL,
                solicitante VARCHAR(255) NOT NULL,
                departamento VARCHAR(100) NOT NULL,
                tipo_riesgo VARCHAR(100) NOT NULL,
                severidad ENUM('Bajo', 'Medio', 'Alto', 'Crítico') NOT NULL,
                descripcion TEXT,
                sistemas_afectados TEXT,
                impacto_financiero DECIMAL(15, 2),
                estado ENUM('Borrador', 'Enviado', 'En Revisión', 'Aprobado', 'Rechazado') DEFAULT 'Enviado',
                usuario_id INT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
            )
        `;

        await db.execute(createTableQuery);
        console.log('Tabla "solicitudes_riesgo" creada o ya existía.');
        process.exit(0);
    } catch (error) {
        console.error('Error en la migración:', error.message);
        process.exit(1);
    }
}

migrate();
