const crypto = require("crypto");

function encryptAES(text, key) {
    const secret = key || process.env.JWT_SECRET;
    const iv = Buffer.alloc(16, 0); // IV 16 byte kosong
    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(secret.padEnd(32, " ")),
        iv
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

module.exports = { encryptAES };