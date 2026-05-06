require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsers() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

    try {
        const db = await mysql.createPool(dbConfig);
        await db.execute("UPDATE usuarios SET is_verified = 1 WHERE email = 'pantajimenezgabriel@gmail.com'");
        console.log('Cuenta verificada manualmente');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkUsers();
