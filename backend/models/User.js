const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        default: 'student',
    },
    department: {
        type: String,
        enum: ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Administration', 'General'],
        default: 'General',
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true, // Only for students
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true, // For faculty and admin
    },
    semester: {
        type: Number,
        min: 1,
        max: 8,
        // Only applicable for students
    },
    currentCredits: {
        type: Number,
        default: 0,
        min: 0
    },
    maxCredits: {
        type: Number,
        default: 24,
        // Maximum credits a student can enroll in per semester
    },
    status: {
        type: String,
        enum: ['Active', 'Deactivated'],
        default: 'Active'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
