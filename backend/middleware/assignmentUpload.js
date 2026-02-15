const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const assignmentDir = 'uploads/assignments';
const submissionDir = 'uploads/submissions';

if (!fs.existsSync(assignmentDir)) {
    fs.mkdirSync(assignmentDir, { recursive: true });
}
if (!fs.existsSync(submissionDir)) {
    fs.mkdirSync(submissionDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'assignmentFile') {
            cb(null, assignmentDir);
        } else {
            cb(null, submissionDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG.'), false);
    }
};

const assignmentUpload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

module.exports = assignmentUpload;
