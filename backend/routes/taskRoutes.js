const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create task
router.post("/", protect, async (req, res) => {
    try {
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
            user: req.user
        });

        const savedTask = await task.save();

        res.status(201).json(savedTask);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// Get user's tasks
router.get("/", protect, async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user
        });

        res.json(tasks);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// Get one user's task
router.get("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// Update user's task
router.put("/:id", protect, async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user
            },
            req.body,
            {
                new: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(updatedTask);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// Delete user's task
router.delete("/:id", protect, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user
        });

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


module.exports = router;