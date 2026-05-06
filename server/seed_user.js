require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

    try {
        const db = await mysql.createPool(dbConfig);
        
        const email = 'admin@admin.com';
        const password = 'admin';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if exists
        const [existing] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existing.length === 0) {
            await db.execute(
                'INSERT INTO usuarios (email, password, is_verified) VALUES (?, ?, ?)',
                [email, hashedPassword, true]
            );
            console.log('Usuario creado exitosamente');
        } else {
             await db.execute(
                'UPDATE usuarios SET is_verified = true, password = ? WHERE email = ?',
                [hashedPassword, email]
            );
            console.log('Usuario actualizado exitosamente');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedAdmin();
