const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// 👇 LÍMITES AMPLIADOS (Esto evita el error 413 o que se trabe con las imágenes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Conexión a la Base de Datos MySQL
const db = mysql.createConnection({
    host: 'b4cykf3opybrv75sky4n-mysql.services.clever-cloud.com',
    user: 'usf9p696q7fbkuhf',
    password: 'cAWrY240vNzyN7Sc75lX', // Copia la contraseña del candado de tu panel
    database: 'b4cykf3opybrv75sky4n',
    port: 3306,
    ssl: { rejectUnauthorized: false } // Importante para conexiones seguras en la nube
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado exitosamente a la base de datos MySQL: mi_tiendita_movil_db');
});

// 1. RUTA DE REGISTRO (Incluye consentimiento del Aviso de Privacidad)
app.post('/api/registro', async (req, res) => {
    const { nombre, correo, password, aceptoAviso } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    if (!aceptoAviso) {
        return res.status(400).json({ mensaje: 'Debe aceptar el Aviso de Privacidad y el uso de datos personales.' });
    }

    try {
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO usuarios (nombre, correo, password, acepto_aviso) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, correo, hashedPassword, aceptoAviso], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
                }
                return res.status(500).json({ mensaje: 'Error al registrar usuario', error: err });
            }
            res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// 2. RUTA DE LOGIN
app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ mensaje: 'Por favor, ingrese correo y contraseña' });
    }

    const query = 'SELECT * FROM usuarios WHERE correo = ?';
    db.query(query, [correo], async (err, results) => {
        if (err) return res.status(500).json({ mensaje: 'Error en el servidor', error: err });

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = results[0];
        const esValida = await bcrypt.compare(password, usuario.password);

        if (!esValida) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });
    });
});

// --- ENDPOINTS DE PRODUCTOS ---

// 1. Obtener todos los productos
app.get('/api/productos', (req, res) => {
    const query = 'SELECT * FROM productos ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json(results);
    });
});

// 2. Agregar un nuevo producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock, imagen } = req.body;
    const query = 'INSERT INTO productos (nombre, precio, stock, imagen) VALUES (?, ?, ?, ?)';
    
    db.query(query, [nombre, precio, stock, imagen], (err, result) => {
        if (err) {
            console.error('Error al guardar producto:', err);
            return res.status(500).json({ error: 'Error al guardar el producto' });
        }
        res.json({ message: 'Producto agregado con éxito', id: result.insertId });
    });
});

// 3. Eliminar un producto por ID
app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM productos WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).json({ error: 'Error al eliminar el producto' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    });
});

app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});