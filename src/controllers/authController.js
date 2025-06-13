const jwt = require("jsonwebtoken");
const moment = require("moment");
const db = require('../config/db');
const { encryptAES } = require('../utils/encrypt');

exports.getToken = async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const { username, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const user = rows[0];

        const encryptedPassword = encryptAES(password);
        if (user.password !== encryptedPassword) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const payload = {
            id: user.id,
            username: user.username,
            password: encryptedPassword,
            timestamp: moment().unix(),
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        const expiredAt = moment().add(1, 'hour').toDate();

        await db.query(
            "INSERT INTO admin_token (admin_id, token, expired_at) VALUES (?, ?, ?)",
            [user.id, token, expiredAt]
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
}

