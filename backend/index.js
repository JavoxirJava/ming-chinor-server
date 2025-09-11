const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const cors = require('cors'); // hozircha O'CHIQ
// const { userBot } = require('./bot/bot'); // hozircha O'CHIQ

dotenv.config();
const app = express();

app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// 1) Tez ping — eng tepada
app.get('/__ping', (req, res) => res.type('text').send('pong'));

// 2) Diagnostika bypass (xohlasa yoqing)
// app.use((req, res, next) => {
//     console.log('REQ:', req.method, req.url);
//     if (process.env.BYPASS === '1') return res.status(200).send('early-ok');
//     next();
// });

// 3) (Hoziр CORS yo‘q. Nginx qaytaradi.)

// 4) Mongo ulanadi, lekin yiqitmaydi
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ MongoDB ulandi');
    } catch (e) {
        console.error('❌ MongoDB ulana olmadi:', e.message);
    }
})();

// 5) Asosiy root
// app.get('/', (req, res) => res.send('🚀 Backend ishlayapti'));

// // 6) Routerlar
// app.use('/api/v1/categories', require('./routes/categoryRoutes'));
// app.use('/api/v1/products', require('./routes/productRoutes'));
// app.use('/api/v1/basket', require('./routes/basketRoutes'));
// app.use('/api/v1/order', require('./routes/orderRoutes'));
// app.use('/api/v1/user', require('./routes/userRoutes'));
// app.use('/api/v1/admin', require('./routes/adminRoutes'));

// 7) Botni keyin yoqasiz (hozircha izohda)
// userBot.launch().then(() => console.log('Telegram bot ishga tushdi ✅'));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Server ${PORT}-portda`));

process.on('unhandledRejection', err => {
    console.error('❌ Unhandled error:', err);
});
