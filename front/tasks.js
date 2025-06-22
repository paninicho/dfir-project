const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// @route   POST api/tasks/:id/submit
// @desc    퀴즈 정답 제출 (수정된 로직)
router.post('/:id/submit', auth, async (req, res) => {
    const { answer, quizIndex } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    try {
        const task = await Task.findById(taskId);
        if (!task || !task.quizzes || !task.quizzes[quizIndex]) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const quiz = task.quizzes[quizIndex];
        const user = await User.findById(userId);

        const isCorrect = quiz.answer.toLowerCase().trim() === answer.toLowerCase().trim();

        if (isCorrect) {
            const quizIdentifier = `${taskId}-${quizIndex}`;
            
            // 이미 푼 퀴즈인지 확인
            if (!user.solvedQuizzes.includes(quizIdentifier)) {
                user.points += quiz.points;
                user.solvedQuizzes.push(quizIdentifier);
                await user.save();
            }
            
            const updatedUser = await User.findById(userId).select('-password');
            res.json({ correct: true, msg: `정답입니다! ${quiz.points} 포인트를 획득했습니다.`, user: updatedUser });
        } else {
            res.json({ correct: false, msg: '틀렸습니다. 다시 시도해보세요.' });
        }

    } catch (err) {
        console.error('Quiz submission error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
