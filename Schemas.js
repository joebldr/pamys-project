// models/Schemas.js
const mongoose = require('mongoose');

// Modelo Productos
const Product = mongoose.model('Product', new mongoose.Schema({
    nombre: String, precio: Number, desc: String, img: String
}));

// Modelo Promociones
const Promotion = mongoose.model('Promotion', new mongoose.Schema({
    nombre: String, precio: Number, desc: String, img: String
}));

// Modelo Cupones
const Coupon = mongoose.model('Coupon', new mongoose.Schema({
    codigo: { type: String, unique: true },
    descuento: Number,
    tipo: { type: String, default: 'fijo' } 
}));

// Modelo Usuarios
const User = mongoose.model('User', new mongoose.Schema({
    user: { type: String, unique: true },
    pass: String,
    role: { type: String, default: 'client' }
}));

module.exports = { Product, Promotion, Coupon, User };