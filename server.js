const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

// IMPORTAMOS LOS MODELOS (Ruta corregida)
const { Product, Promotion, Coupon, User } = require('./models/Schemas');

const app = express();

// --- SEGURIDAD RELAJADA ---
// Permite cargar imágenes externas y locales sin bloqueo
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors());
app.use(express.json());

// --- ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'dist')));

// Conexión a Base de Datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ DB Conectada'))
    .catch(err => console.error('❌ Error DB:', err));

// --- MIDDLEWARE JWT ---
const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'Acceso denegado' });
    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado;
        next();
    } catch (error) { res.status(400).json({ msg: 'Token no válido' }); }
};

// --- RUTAS ---

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

// --- PRODUCTOS (MENÚ) ---
app.get('/api/products', async (req, res) => res.json(await Product.find()));

app.post('/api/products', verificarToken, async (req, res) => {
    await new Product(req.body).save(); res.json({msg:"OK"});
});

// [NUEVO] RUTA PARA EDITAR PRODUCTO (PUT)
app.put('/api/products/:id', verificarToken, async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.json({ msg: "Producto actualizado" });
    } catch (e) { res.status(500).json({ msg: "Error al actualizar" }); }
});

app.delete('/api/products/:id', verificarToken, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id); res.json({msg:"OK"});
});


// --- PROMOCIONES (INICIO) ---
app.get('/api/promotions', async (req, res) => res.json(await Promotion.find()));

app.post('/api/promotions', verificarToken, async (req, res) => {
    await new Promotion(req.body).save(); res.json({msg:"OK"});
});

// [NUEVO] RUTA PARA EDITAR PROMOCIÓN (PUT)
app.put('/api/promotions/:id', verificarToken, async (req, res) => {
    try {
        await Promotion.findByIdAndUpdate(req.params.id, req.body);
        res.json({ msg: "Promoción actualizada" });
    } catch (e) { res.status(500).json({ msg: "Error al actualizar" }); }
});

app.delete('/api/promotions/:id', verificarToken, async (req, res) => {
    await Promotion.findByIdAndDelete(req.params.id); res.json({msg:"OK"});
});


// --- CUPONES ---
app.get('/api/coupons', async (req, res) => res.json(await Coupon.find()));
app.post('/api/coupons', verificarToken, async (req, res) => {
    try { await new Coupon(req.body).save(); res.json({msg:"OK"}); }
    catch (e) { res.status(400).json({msg:"Error"}); }
});
app.delete('/api/coupons/:id', verificarToken, async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id); res.json({msg:"OK"});
});


// --- TRELLO ---
app.post('/api/order/trello', async (req, res) => {
    const { cliente, carrito, total } = req.body;
    let descripcion = `👤 **Cliente:** ${cliente}\n💰 **Total:** $${total}\n\n🛒 **Detalle del Pedido:**\n`;
    carrito.forEach(item => { descripcion += `- ${item.nombre} ($${item.precio})\n`; });
    descripcion += `\n🕒 Hora: ${new Date().toLocaleTimeString()}`;

    try {
        const url = `https://api.trello.com/1/cards?idList=${process.env.TRELLO_LIST_ID}&key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`;
        await axios.post(url, { name: `Pedido de ${cliente} - $${total}`, desc: descripcion, pos: 'top' });
        res.json({ msg: "Pedido enviado a cocina (Trello)" });
    } catch (error) {
        console.error("Error Trello:", error.response ? error.response.data : error.message);
        res.status(500).json({ msg: "Error al conectar con Trello" });
    }
});

// --- RUTA COMODÍN PARA REACT ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- INICIAR SERVIDOR ---
app.listen(process.env.PORT || 10000, () => {
    console.log(`🚀 Puerto ${process.env.PORT || 10000}`);
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