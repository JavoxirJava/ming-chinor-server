// backend/index.js (CORS YO‘Q)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const cors = require('cors'); // ❌ kerak emas
const { userBot } = require('./bot/bot');
const createDefaultAdmin = require('./utils/createDefaultAdmin');

dotenv.config();
const app = express();

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// CORS bilan bog‘liq HECH NIMA YO‘Q — Nginx hal qiladi ✅

// MongoDB
mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000, // mongoga ulanishni 5s da timeout
    socketTimeoutMS: 10000,         // uzoq querylar uchun soket timeout
    connectTimeoutMS: 10000,        // TCP connect timeout
    // authSource, dbName va boshqalar kerak bo'lsa shu yerga
})
    .then(() => console.log('✅ MongoDB ulandi'))
    .catch(err => console.error('❌ MongoDB xato:', err));

// Health
app.get('/', (_, res) => res.send('🚀 Bot backend ishlayapti'));

// Routes
app.use('/api/v1/categories', require('./routes/categoryRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/basket', require('./routes/basketRoutes'));
app.use('/api/v1/order', require('./routes/orderRoutes'));
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

createDefaultAdmin();

// Bot
userBot.launch().then(() => console.log('Telegram bot ishga tushdi ✅'));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Server ${PORT}-portda ishlayapti`));

process.on('unhandledRejection', err => {
    console.error('❌ Unhandled error:', err);
});
