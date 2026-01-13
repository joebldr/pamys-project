const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helmet = require('helmet'); // <--- ESTA ES LA LÍNEA QUE TE FALTABA
const axios = require('axios');   // Para lo de Trello
require('dotenv').config();

// IMPORTAMOS LOS MODELOS
const { Product, Promotion, Coupon, User } = require('./models/Schemas');

const app = express();

// --- SEGURIDAD Y CONFIGURACIÓN ---
app.use(helmet()); // Ahora sí va a funcionar porque ya lo importamos arriba
app.use(cors());
app.use(express.json());

// Conexión a Base de Datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ DB Conectada'))
    .catch(err => console.error('❌ Error DB:', err));

// --- MIDDLEWARE DE SEGURIDAD (JWT) ---
const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'Acceso denegado' });
    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado;
        next();
    } catch (error) { res.status(400).json({ msg: 'Token no válido' }); }
};

// --- RUTAS (ENDPOINTS) ---

// Auth
app.post('/api/register', async (req, res) => {
    try { 
        const existe = await User.findOne({ user: req.body.user });
        if (existe) return res.status(400).json({ msg: "Usuario ya existe" });
        const nuevo = new User(req.body); 
        await nuevo.save(); 
        res.json({ msg: "OK" }); 
    } catch (e) { res.status(400).json({ msg: "Error al registrar" }); }
});

app.post('/api/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        const found = await User.findOne({ user, pass });
        if (!found) return res.status(400).json({ msg: 'Credenciales incorrectas' });
        const token = jwt.sign({ id: found._id, role: found.role }, process.env.JWT_SECRET);
        res.json({ token, role: found.role, msg: "Login exitoso" });
    } catch (e) { res.status(500).json({ msg: "Error servidor" }); }
});

// Productos (Menú)
app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/products', verificarToken, async (req, res) => {
    await new Product(req.body).save(); res.json({msg:"OK"});
});
app.delete('/api/products/:id', verificarToken, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id); res.json({msg:"OK"});
});

// Promociones (Inicio)
app.get('/api/promotions', async (req, res) => res.json(await Promotion.find()));
app.post('/api/promotions', verificarToken, async (req, res) => {
    await new Promotion(req.body).save(); res.json({msg:"OK"});
});
app.delete('/api/promotions/:id', verificarToken, async (req, res) => {
    await Promotion.findByIdAndDelete(req.params.id); res.json({msg:"OK"});
});

// Cupones
app.get('/api/coupons', async (req, res) => res.json(await Coupon.find()));
app.post('/api/coupons', verificarToken, async (req, res) => {
    try { await new Coupon(req.body).save(); res.json({msg:"OK"}); }
    catch (e) { res.status(400).json({msg:"Error"}); }
});
app.delete('/api/coupons/:id', verificarToken, async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id); res.json({msg:"OK"});
});

// --- RUTA NUEVA: TRELLO ---
app.post('/api/order/trello', async (req, res) => {
    const { cliente, carrito, total } = req.body;

    let descripcion = `👤 **Cliente:** ${cliente}\n💰 **Total:** $${total}\n\n🛒 **Detalle del Pedido:**\n`;
    carrito.forEach(item => {
        descripcion += `- ${item.nombre} ($${item.precio})\n`;
    });
    descripcion += `\n🕒 Hora: ${new Date().toLocaleTimeString()}`;

    try {
        const url = `https://api.trello.com/1/cards?idList=${process.env.TRELLO_LIST_ID}&key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`;
        
        await axios.post(url, {
            name: `Pedido de ${cliente} - $${total}`,
            desc: descripcion,
            pos: 'top'
        });

        res.json({ msg: "Pedido enviado a cocina (Trello)" });
    } catch (error) {
        console.error("Error Trello:", error.response ? error.response.data : error.message);
        res.status(500).json({ msg: "Error al conectar con Trello" });
    }
});

// --- ESTO HACE QUE SE VEA TU PÁGINA EN RENDER ---

// 1. Decirle a Express que la carpeta 'dist' tiene los archivos visuales
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Cualquier ruta que no sea API, manda a la página de React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// (Aquí abajo sigue tu línea de // Iniciar Servidor...)

// Iniciar Servidor
app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Puerto ${process.env.PORT || 3000}`);
    const createAdmin = async () => {
        try {
            const adminExists = await User.findOne({ user: 'admin' });
            if (!adminExists) {
                await User.create({ user: 'admin', pass: '123456', role: 'admin' });
                console.log('👑 Admin creado: admin / 123456');
            }
        } catch (e) { console.error("Error creando admin", e); }
    };
    createAdmin();
});