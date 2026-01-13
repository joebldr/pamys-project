const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    nombre: String,
    desc: String,
    precio: Number,
    img: String,
    categoria: String
});

const PromotionSchema = new mongoose.Schema({
    titulo: String,
    desc: String,
    precio: Number,
    img: String
});

const CouponSchema = new mongoose.Schema({
    codigo: String,
    descuento: Number,
    activo: Boolean
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
