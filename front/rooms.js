/*
============================================================
// 파일: routes/rooms.js (신규 파일)
============================================================
*/
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// @route   GET api/rooms/:id
// @desc    ID로 특정 학습 방 정보 가져오기
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('tasks');
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }
        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

