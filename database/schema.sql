-- Script para la base de datos de Validación de Prueba de Servicios TI
-- Base de datos: servicios_ti

CREATE DATABASE IF NOT EXISTS servicios_ti;
USE servicios_ti;

-- Tabla de Servicios de TI
CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado ENUM('Pendiente', 'En Proceso', 'Validado', 'Rechazado') DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías de Prueba
CREATE TABLE IF NOT EXISTS categorias_prueba (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar categorías por defecto
INSERT IGNORE INTO categorias_prueba (nombre) VALUES 
('Conectividad'), 
('Seguridad'), 
('Rendimiento'), 
('Funcionalidad');

-- Tabla de Casos de Prueba
CREATE TABLE IF NOT EXISTS casos_prueba (
    id INT AUTO_INCREMENT PRIMARY KEY,
    servicio_id INT,
    categoria_id INT,
    descripcion VARCHAR(255) NOT NULL,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_prueba(id)
);

-- Tabla de Validaciones (Resultados)
CREATE TABLE IF NOT EXISTS validaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caso_id INT,
    resultado ENUM('Pasó', 'Falló', 'No Aplica', 'Pendiente') DEFAULT 'Pendiente',
    observaciones TEXT,
    fecha_validacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caso_id) REFERENCES casos_prueba(id) ON DELETE CASCADE
);

-- Insertar algunos servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, estado) VALUES 
('Servidor de Archivos v2.0', 'Actualización de almacenamiento y permisos NFS.', 'Pendiente'),
('API de Autenticación', 'Migración a OAuth2 y actualización de JWT.', 'En Proceso'),
('Dashboard de Monitoreo', 'Nueva interfaz para el equipo de SOC.', 'Pendiente');

-- Insertar casos de prueba para el primer servicio
INSERT INTO casos_prueba (servicio_id, categoria_id, descripcion) VALUES 
(1, 1, 'Verificación de ping al servidor'),
(1, 1, 'Acceso via SSH mediante puerto 22'),
(1, 2, 'Permisos de lectura/escritura restringidos'),
(1, 4, 'Carga de archivos de prueba exitosa');
