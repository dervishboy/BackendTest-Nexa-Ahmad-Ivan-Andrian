const db = require('../config/db');

const generateNip = async () => {
    const year = new Date().getFullYear();
    const [rows] = await db.query("SELECT MAX(RIGHT(nip,4)) AS maxCounter FROM karyawan WHERE LEFT(nip,4) = ?", [year]);
    const counter = rows[0].maxCounter ? parseInt(rows[0].maxCounter) + 1 : 1;
    return `${year}${counter.toString().padStart(4, '0')}`;
};

const escapeLike = (value) => {
    return value.replace(/[%_]/g, '\\$&');
};

exports.registerKaryawan = async (req, res) => {
    try {
        const { nama, alamat, gend, tgl_lahir, photo } = req.body;

        if (!nama || !alamat || !gend || !tgl_lahir || !photo) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }

        const username = req.user?.username;
        if (!username) {
            return res.status(403).json({ error: 'Token tidak valid' });
        }

        const [admins] = await db.query("SELECT id FROM admin WHERE username = ?", [username]);
        if (admins.length === 0) {
            return res.status(401).json({ message: "Admin tidak ditemukan" });
        }
        const admin_id = admins[0].id;

        const nip = await generateNip();
        const status = 1;

        const [result] = await db.query(
            'CALL sp_add_kary_AhmadIvanAndrian(?, ?, ?, ?, ?, ?, ?, ?)',
            [nip, nama, alamat, gend, tgl_lahir, photo, admin_id, status]
        );

        const procedureStatus = result[0]?.status;
        if (procedureStatus === 'duplicate') {
            return res.status(409).json({ error: 'NIP sudah terdaftar' });
        } else if (procedureStatus === 'error_sql') {
            return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
        } else if (procedureStatus === 'success') {
            return res.status(201).json({ message: 'Karyawan berhasil ditambahkan', nip });
        } else {
            return res.status(500).json({ error: 'Hasil tidak diketahui dari prosedur tersimpan' });
        }
    } catch (error) {
        console.error('Error registering karyawan:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

exports.getKaryawanList = async (req, res) => {
    try {
        const { keyword = '', start = 0, count = 10 } = req.query;

        const username = req.user?.username;
        if (!username) {
            return res.status(403).json({ error: 'Token tidak valid' });
        }

        const [admins] = await db.query("SELECT id FROM admin WHERE username = ?", [username]);
        if (admins.length === 0) {
            return res.status(401).json({ message: "Admin tidak ditemukan" });
        }

        const escapedKeyword = `%${escapeLike(keyword)}%`;
        const [rows] = await db.query(
            "SELECT * FROM karyawan WHERE nama LIKE ? LIMIT ?, ?",
            [escapedKeyword, parseInt(start), parseInt(count)]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        return res.status(200).json({ data: rows });
    } catch (error) {
        console.error('Error fetching karyawan list:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

exports.updateKaryawan = async (req, res) => {
    try {
        const { nip, nama, alamat, gend, tgl_lahir, photo } = req.body;

        if (!nip || !nama || !alamat || !gend || !tgl_lahir || !photo) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }

        const username = req.user?.username;
        if (!username) {
            return res.status(403).json({ error: 'Token tidak valid' });
        }

        const [admins] = await db.query("SELECT id FROM admin WHERE username = ?", [username]);
        if (admins.length === 0) {
            return res.status(401).json({ message: "Admin tidak ditemukan" });
        }

        const [result] = await db.query(
            "UPDATE karyawan SET nama = ?, alamat = ?, gend = ?, tgl_lahir = ?, photo = ? WHERE nip = ?",
            [nama, alamat, gend, tgl_lahir, photo, nip]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Karyawan tidak ditemukan atau gagal diperbarui' });
        }

        return res.status(200).json({ message: 'Karyawan berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating karyawan:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

exports.deactivateKaryawan = async (req, res) => {
    try {
        const { nip } = req.body;

        if (!nip) {
            return res.status(400).json({ error: 'NIP harus diisi' });
        }

        const username = req.user?.username;
        if (!username) {
            return res.status(403).json({ error: 'Token tidak valid' });
        }

        const [admins] = await db.query("SELECT id FROM admin WHERE username = ?", [username]);
        if (admins.length === 0) {
            return res.status(401).json({ message: "Admin tidak ditemukan" });
        }

        const [result] = await db.query(
            "UPDATE karyawan SET status = 9 WHERE nip = ?",
            [nip]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Karyawan tidak ditemukan atau gagal dinonaktifkan' });
        }

        return res.status(200).json({ message: 'Karyawan berhasil dinonaktifkan' });
    } catch (error) {
        console.error('Error deactivating karyawan:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
