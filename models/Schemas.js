const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    nombre: String,
    desc: String,
    precio: Number,
    img: String,
    categoria: String
});

// --- CORRECCIÓN 1: Cambiamos 'titulo' por 'nombre' ---
// Ahora coincide con lo que envía tu Frontend (AdminPanel)
const PromotionSchema = new mongoose.Schema({
    nombre: String, 
    desc: String,
    precio: Number,
    img: String
});

// --- CORRECCIÓN 2: Agregamos 'tipo' ---
// Para saber si el descuento es '%' o '$'
const CouponSchema = new mongoose.Schema({
    codigo: String,
    descuento: Number,
    activo: Boolean,
    tipo: String 
});

const UserSchema = new mongoose.Schema({
    user: String,
    pass: String,
    role: { type: String, default: 'user' }
});

const Product = mongoose.model('Product', ProductSchema);
const Promotion = mongoose.model('Promotion', PromotionSchema);
const Coupon = mongoose.model('Coupon', CouponSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { Product, Promotion, Coupon, User };
