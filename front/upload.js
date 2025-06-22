/*
============================================================
// 파일: routes/upload.js (최종본)
// 역할: 관리자 인증을 거쳐 이미지를 서버에 안전하게 업로드합니다.
============================================================
*/
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

router.post('/image', [auth, admin], upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }
    res.json({ url: `http://localhost:5000/${req.file.path.replace(/\\/g, "/")}` });
});

module.exports = router;
