/*
============================================================
// 파일: routes/auth.js (중복 코드 수정 완료)
============================================================
*/
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    사용자 회원가입
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // 1. 이미 존재하는 사용자인지 확인
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. 관리자 이메일로 가입 시도하는지 확인
        // (seeder.js에 설정한 관리자 이메일과 동일하게 맞춰주세요)
        if (email === 'admin@example.com' || email === 'letsgojjangdol@gmail.com') {
             return res.status(400).json({ msg: 'Cannot register with admin email.' });
        }

        // 3. 비밀번호 암호화 및 새 사용자 생성
        const salt = await bcrypt.genSalt(10);
        user = new User({ 
            username, 
            email, 
            password: await bcrypt.hash(password, salt) 
        });
        await user.save();
        
        // 4. JWT 토큰 발급
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '5h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    사용자 로그인
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '5h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth
// @desc    로그인된 사용자 정보 가져오기
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
