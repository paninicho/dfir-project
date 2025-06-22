
/*
============================================================
// 파일: routes/paths.js (populate 수정)
============================================================
*/
const express = require('express');
const router = express.Router();
const Path = require('../models/Path');

// @route   GET api/paths
// @desc    모든 학습 경로와 하위 Room/Task 정보 가져오기
// @access  Public
router.get('/', async (req, res) => {
    try {
        // populate를 통해 Path에 속한 Room, 그리고 Room에 속한 Task 정보까지 모두 불러옴
        const paths = await Path.find().populate({
            path: 'rooms',
            model: 'Room',
            populate: {
                path: 'tasks',
                model: 'Task'
            }
        });
        res.json(paths);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;

