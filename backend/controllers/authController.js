const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, rollNumber, employeeId, department } = req.body;

    try {
        // 1. Email domain restriction
        if (!email.endsWith('@college.edu')) {
            return res.status(400).json({ message: 'Registration allowed only for @college.edu email addresses' });
        }

        // 2. Validate role-specific IDs
        if (role === 'student' && !rollNumber) {
            return res.status(400).json({ message: 'Roll number is required for students' });
        }
        if ((role === 'faculty' || role === 'admin') && !employeeId) {
            return res.status(400).json({ message: 'Employee ID is required for faculty/admin' });
        }

        // 3. Check if user already exists (email or ID)
        const userExists = await User.findOne({
            $or: [
                { email },
                { rollNumber: rollNumber || undefined },
                { employeeId: employeeId || undefined }
            ].filter(query => Object.values(query)[0] !== undefined)
        });

        if (userExists) {
            return res.status(400).json({ message: 'User with this email, roll number, or employee ID already exists' });
        }

        // 4. Create user
        const userData = {
            name,
            email,
            password,
            role,
            department
        };

        if (role === 'student') userData.rollNumber = rollNumber;
        else userData.employeeId = employeeId;

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                rollNumber: user.rollNumber,
                employeeId: user.employeeId,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token (Login via Roll Number / Employee ID)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // Search by rollNumber OR employeeId
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { rollNumber: identifier },
                { employeeId: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid ID or password' });
        }

        // Check if account is active
        if (user.status === 'Deactivated' || user.isActive === false) {
            return res.status(401).json({ message: 'Account has been deactivated. Contact admin.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid ID or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            rollNumber: user.rollNumber,
            employeeId: user.employeeId,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                employeeId: user.employeeId,
                department: user.department,
                semester: user.semester
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe };
