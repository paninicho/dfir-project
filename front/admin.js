/*
============================================================
// 파일: routes/admin.js (최종본)
// 역할: 모든 관리자 기능을 처리하는 최종 API 로직입니다.
============================================================
*/
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Path = require('../models/Path');
const Room = require('../models/Room');
const Task = require('../models/Task');

router.get('/all-content', [auth, admin], async (req, res) => {
    try {
        const paths = await Path.find().populate({
            path: 'rooms',
            populate: { path: 'tasks', model: 'Task' }
        });
        res.json({ paths });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/paths', [auth, admin], async (req, res) => {
    try {
        const { _id, ...pathData } = req.body;
        const newPath = new Path(pathData);
        await newPath.save();
        res.status(201).json(newPath);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/rooms', [auth, admin], async (req, res) => {
    try {
        const { _id, pathId, ...roomData } = req.body;
        if (!pathId) return res.status(400).json({ msg: 'Path ID is required.' });
        const newRoom = new Room(roomData);
        const savedRoom = await newRoom.save();
        await Path.findByIdAndUpdate(pathId, { $push: { rooms: savedRoom._id } });
        res.status(201).json(savedRoom);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/tasks', [auth, admin], async (req, res) => {
    try {
        const { _id, roomId, quizzes, ...taskData } = req.body;
        if (!roomId) return res.status(400).json({ msg: 'Room ID is required.' });
        if (quizzes && typeof quizzes === 'string') {
            taskData.quizzes = JSON.parse(quizzes);
        } else {
            taskData.quizzes = [];
        }
        const newTask = new Task(taskData);
        const savedTask = await newTask.save();
        await Room.findByIdAndUpdate(roomId, { $push: { tasks: savedTask._id } });
        res.status(201).json(savedTask);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.put('/paths/:id/reorder-rooms', [auth, admin], async (req, res) => {
    try {
        const { orderedRoomIds } = req.body;
        const path = await Path.findById(req.params.id);
        if (!path) return res.status(404).json({ msg: 'Path not found' });
        path.rooms = orderedRoomIds;
        await path.save();
        res.json({ msg: 'Room order updated' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

router.put('/rooms/:id/reorder-tasks', [auth, admin], async (req, res) => {
    try {
        const { orderedTaskIds } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        room.tasks = orderedTaskIds;
        await room.save();
        res.json({ msg: 'Task order updated' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});
// @route   PUT api/admin/paths/:id
// @desc    학습 경로 수정
router.put('/paths/:id', [auth, admin], async (req, res) => {
    try {
        const { _id, ...pathData } = req.body;
        const updatedPath = await Path.findByIdAndUpdate(req.params.id, pathData, { new: true });
        if (!updatedPath) return res.status(404).json({ msg: 'Path not found' });
        res.json(updatedPath);
    } catch (err) {
        console.error(`Error updating path ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT api/admin/rooms/:id
// @desc    학습 방 수정
router.put('/rooms/:id', [auth, admin], async (req, res) => {
    try {
        const { _id, pathId, ...roomData } = req.body;
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, roomData, { new: true });
        if (!updatedRoom) return res.status(404).json({ msg: 'Room not found' });
        
        await Path.updateMany({ rooms: req.params.id }, { $pull: { rooms: req.params.id } });
        if (pathId) {
            await Path.findByIdAndUpdate(pathId, { $push: { rooms: req.params.id } });
        }
        res.json(updatedRoom);
    } catch (err) {
        console.error(`Error updating room ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT api/admin/tasks/:id
// @desc    과제 수정 (다중 퀴즈 지원)
router.put('/tasks/:id', [auth, admin], async (req, res) => {
    try {
        const { _id, roomId, quizzes, ...taskData } = req.body;

        if (quizzes && typeof quizzes === 'string') {
            taskData.quizzes = JSON.parse(quizzes);
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, taskData, { new: true });
        if (!updatedTask) return res.status(404).json({ msg: 'Task not found' });

        await Room.updateMany({ tasks: req.params.id }, { $pull: { tasks: req.params.id } });
        if (roomId) {
            await Room.findByIdAndUpdate(roomId, { $push: { tasks: req.params.id } });
        }
        res.json(updatedTask);
    } catch (err) {
        console.error(`Error updating task ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT api/admin/paths/:id/reorder-rooms
// @desc    경로에 속한 방들의 순서 업데이트
router.put('/paths/:id/reorder-rooms', [auth, admin], async (req, res) => {
    try {
        const { orderedRoomIds } = req.body;
        const path = await Path.findById(req.params.id);
        if (!path) return res.status(404).json({ msg: 'Path not found' });
        path.rooms = orderedRoomIds;
        await path.save();
        res.json({ msg: 'Room order updated successfully' });
    } catch (err) {
        console.error(`Error reordering rooms for path ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT api/admin/rooms/:id/reorder-tasks
// @desc    방에 속한 과제들의 순서 업데이트
router.put('/rooms/:id/reorder-tasks', [auth, admin], async (req, res) => {
    try {
        const { orderedTaskIds } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        room.tasks = orderedTaskIds;
        await room.save();
        res.json({ msg: 'Task order updated successfully' });
    } catch (err) {
        console.error(`Error reordering tasks for room ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE api/admin/paths/:id
router.delete('/paths/:id', [auth, admin], async (req, res) => {
    try {
        const path = await Path.findById(req.params.id);
        if (!path) return res.status(404).json({ msg: 'Path not found' });
        
        for (const roomId of path.rooms) {
            const room = await Room.findById(roomId);
            if(room) await Task.deleteMany({ _id: { $in: room.tasks } });
        }
        await Room.deleteMany({ _id: { $in: path.rooms } });
        await path.deleteOne();
        
        res.status(204).send();
    } catch (err) {
        console.error(`Error deleting path ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE api/admin/rooms/:id
router.delete('/rooms/:id', [auth, admin], async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });

        await Task.deleteMany({ _id: { $in: room.tasks } });
        await Path.updateMany({}, { $pull: { rooms: room._id } });
        await room.deleteOne();

        res.status(204).send();
    } catch (err) {
        console.error(`Error deleting room ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE api/admin/tasks/:id
router.delete('/tasks/:id', [auth, admin], async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        await Room.updateMany({}, { $pull: { tasks: task._id } });
        await task.deleteOne();

        res.status(204).send();
    } catch (err) {
        console.error(`Error deleting task ${req.params.id}:`, err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
