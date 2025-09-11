const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.loginAdmin = async (req, res) => {
    try {
        const { phone, password } = req.body || {};
        if (!phone || !password) {
            return res.status(400).json({ message: "Phone va password shart" });
        }

        // 1) DB qadamini loglab qo‘ying
        const admin = await Admin.findOne({ phone }).lean(); // .lean() tezroq va xavfsizroq
        if (!admin) 
            return res.status(404).json({ message: "Admin topilmadi" });

        // 2) Hash borligini tekshiring
        if (!admin.password || typeof admin.password !== 'string') 
            return res.status(500).json({ message: "Admin paroli noto‘g‘ri saqlangan" });

        // 3) bcrypt compare
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) 
            return res.status(400).json({ message: "Parol noto‘g‘ri" });

        // 4) JWT
        if (!process.env.JWT_SECRET) 
            return res.status(500).json({ message: "JWT_SECRET yo‘q" });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            token,
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                phone: admin.phone
            }
        });
    } catch (err) {
        console.error("loginAdmin error:", err);
        // Har doim javob qaytaring
        return res.status(500).json({ message: "Internal error", error: String(err?.message || err) });
    }
};


exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select("-__v");
        if (!admin) return res.status(404).json({ message: "Admin topilmadi" });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Server xatoligi" });
    }
};

exports.updateAdmin = async (req, res) => {
    const {fullName, phone, password} = req.body;
    const updateData = {fullName, phone};

    if (password) {
        const hashed = await bcrypt.hash(password, 10);
        updateData.password = hashed;
    }

    const updated = await Admin.findByIdAndUpdate(req.admin.id, updateData, {new: true});
    res.json(updated);
};


exports.createAdmin = async (req, res) => {
    const {fullName, phone, password} = req.body;
    const exists = await Admin.findOne({phone});
    if (exists) return res.status(400).json({message: "Bu raqamli admin allaqachon mavjud"});

    const newAdmin = new Admin({fullName, phone, password});
    await newAdmin.save();
    res.status(201).json({message: "Yangi admin yaratildi"});
};

