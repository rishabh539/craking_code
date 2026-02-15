const Task = require('../models/Task');

// @desc    Create student task
// @route   POST /api/tasks
// @access  Private (Student)
const createTask = async (req, res) => {
    try {
        const { title, description, category, priority, deadline, milestones, tags } = req.body;

        const task = new Task({
            student: req.user._id,
            title,
            description,
            category,
            priority,
            deadline,
            milestones,
            tags
        });

        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get student tasks
// @route   GET /api/tasks
// @access  Private (Student)
const getMyTasks = async (req, res) => {
    try {
        const { status, category, priority } = req.query;
        let query = { student: req.user._id };

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;

        const tasks = await Task.find(query).sort({ deadline: 1, createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task or milestones
// @route   PUT /api/tasks/:id
// @access  Private (Student)
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Student)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get task analytics (progress)
// @route   GET /api/tasks/analytics
// @access  Private (Student)
const getTaskAnalytics = async (req, res) => {
    try {
        const tasks = await Task.find({ student: req.user._id });

        const analytics = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'Completed').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            todo: tasks.filter(t => t.status === 'To Do').length,
            categoryBreakdown: {
                Assignments: tasks.filter(t => t.category === 'Assignments').length,
                Projects: tasks.filter(t => t.category === 'Projects').length,
                Goals: tasks.filter(t => t.category === 'Personal Goals').length,
                Exams: tasks.filter(t => t.category === 'Exam Preparation').length
            }
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getMyTasks,
    updateTask,
    deleteTask,
    getTaskAnalytics
};
