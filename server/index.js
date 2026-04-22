const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Conexión a la base de datos
const connectDB = async () => {
    try {
        const connection = await mysql.createPool(dbConfig);
        console.log('✅ Conectado a MySQL con éxito');
        return connection;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        process.exit(1);
    }
};

let db;
connectDB().then(conn => db = conn);

// Endpoints

// Obtener todos los servicios
app.get('/api/servicios', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM servicios ORDER BY fecha_creacion DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas del dashboard
app.get('/api/estadisticas', async (req, res) => {
    try {
        const [total] = await db.execute('SELECT COUNT(*) as total FROM servicios');
        const [validados] = await db.execute("SELECT COUNT(*) as total FROM servicios WHERE estado = 'Validado'");
        const [rechazados] = await db.execute("SELECT COUNT(*) as total FROM servicios WHERE estado = 'Rechazado'");
        const [pendientes] = await db.execute("SELECT COUNT(*) as total FROM servicios WHERE estado = 'Pendiente'");
        const [enProceso] = await db.execute("SELECT COUNT(*) as total FROM servicios WHERE estado = 'En Proceso'");
        const [pruebasTotal] = await db.execute('SELECT COUNT(*) as total FROM casos_prueba');
        const [pruebasPasaron] = await db.execute("SELECT COUNT(*) as total FROM validaciones WHERE resultado = 'Pasó'");
        const [pruebasFallaron] = await db.execute("SELECT COUNT(*) as total FROM validaciones WHERE resultado = 'Falló'");

        res.json({
            servicios: {
                total: total[0].total,
                validados: validados[0].total,
                rechazados: rechazados[0].total,
                pendientes: pendientes[0].total,
                enProceso: enProceso[0].total
            },
            pruebas: {
                total: pruebasTotal[0].total,
                pasaron: pruebasPasaron[0].total,
                fallaron: pruebasFallaron[0].total
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener detalle de un servicio (incluyendo casos de prueba y sus resultados)
app.get('/api/servicios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [servicio] = await db.execute('SELECT * FROM servicios WHERE id = ?', [id]);
        
        if (servicio.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });

        const [casos] = await db.execute(`
            SELECT cp.*, c.nombre as categoria, v.id as validacion_id, v.resultado, v.observaciones, v.fecha_validacion
            FROM casos_prueba cp
            JOIN categorias_prueba c ON cp.categoria_id = c.id
            LEFT JOIN validaciones v ON cp.id = v.caso_id
            WHERE cp.servicio_id = ?
        `, [id]);

        res.json({ ...servicio[0], pruebas: casos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear o actualizar un resultado de validación
app.post('/api/validaciones', async (req, res) => {
    try {
        const { caso_id, resultado, observaciones } = req.body;
        
        // Verificar si ya existe una validación para este caso
        const [existente] = await db.execute('SELECT id FROM validaciones WHERE caso_id = ?', [caso_id]);
        
        if (existente.length > 0) {
            await db.execute(
                'UPDATE validaciones SET resultado = ?, observaciones = ?, fecha_validacion = CURRENT_TIMESTAMP WHERE caso_id = ?',
                [resultado, observaciones, caso_id]
            );
        } else {
            await db.execute(
                'INSERT INTO validaciones (caso_id, resultado, observaciones) VALUES (?, ?, ?)',
                [caso_id, resultado, observaciones]
            );
        }

        // --- Lógica de actualización automática del estado del servicio ---
        const [prueba] = await db.execute('SELECT servicio_id FROM casos_prueba WHERE id = ?', [caso_id]);
        const servicioId = prueba[0].servicio_id;

        const [todasLasPruebas] = await db.execute(`
            SELECT cp.id, v.resultado 
            FROM casos_prueba cp 
            LEFT JOIN validaciones v ON cp.id = v.caso_id 
            WHERE cp.servicio_id = ?
        `, [servicioId]);

        let nuevoEstado = 'En Proceso';
        const resultados = todasLasPruebas.map(p => p.resultado);

        console.log(`Pruebas encontradas para servicio ${servicioId}:`, resultados);

        if (resultados.every(r => r === 'Pasó')) {
            nuevoEstado = 'Validado';
        } else if (resultados.some(r => r === 'Falló')) {
            nuevoEstado = 'Rechazado';
        }

        console.log(`Cambiando estado de servicio ${servicioId} a: ${nuevoEstado}`);
        await db.execute('UPDATE servicios SET estado = ? WHERE id = ?', [nuevoEstado, servicioId]);
        // -----------------------------------------------------------------

        res.json({ success: true, message: 'Validación guardada y estado actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo servicio con casos de prueba por defecto
app.post('/api/servicios', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        // Insertar el servicio
        const [result] = await db.execute(
            'INSERT INTO servicios (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion]
        );
        const servicioId = result.insertId;

        // Obtener todas las categorías
        const [categorias] = await db.execute('SELECT * FROM categorias_prueba');

        // Crear un caso de prueba por cada categoría
        const descripcionesPorCat = {
            'Conectividad': 'Verificar conectividad de red del servicio',
            'Seguridad': 'Validar políticas de seguridad y accesos',
            'Rendimiento': 'Evaluar rendimiento bajo carga estándar',
            'Funcionalidad': 'Comprobar funcionalidad principal del servicio'
        };

        for (const cat of categorias) {
            const desc = descripcionesPorCat[cat.nombre] || `Prueba de ${cat.nombre}`;
            await db.execute(
                'INSERT INTO casos_prueba (servicio_id, categoria_id, descripcion) VALUES (?, ?, ?)',
                [servicioId, cat.id, desc]
            );
        }

        console.log(`✅ Servicio "${nombre}" creado con ID ${servicioId} y ${categorias.length} pruebas`);
        res.status(201).json({ success: true, id: servicioId, message: 'Servicio creado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar el estado de un servicio
app.patch('/api/servicios/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        await db.execute('UPDATE servicios SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ success: true, message: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar nombre y descripción de un servicio
app.put('/api/servicios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        await db.execute('UPDATE servicios SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id]);
        console.log(`✏️ Servicio ${id} editado: "${nombre}"`);
        res.json({ success: true, message: 'Servicio actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un servicio (CASCADE borra casos_prueba y validaciones)
app.delete('/api/servicios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM servicios WHERE id = ?', [id]);
        console.log(`🗑️ Servicio ${id} eliminado`);
        res.json({ success: true, message: 'Servicio eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
