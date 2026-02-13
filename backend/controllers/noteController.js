const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

// Init upload
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
}).single('noteFile');

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: PDFs Only!');
    }
}

// @desc    Upload a note
// @route   POST /api/notes
// @access  Private (Faculty only)
const uploadNote = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        } else {
            if (req.file == undefined) {
                return res.status(400).json({ message: 'No file selected!' });
            } else {
                try {
                    const { title, subject } = req.body;
                    const note = new Note({
                        title,
                        subject,
                        fileUrl: `/${req.file.path.replace(/\\/g, '/')}`,
                        uploadedBy: req.user._id,
                    });

                    const createdNote = await note.save();
                    res.status(201).json(createdNote);
                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            }
        }
    });
};

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private (Student, Faculty)
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({}).populate('uploadedBy', 'name email');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadNote,
    getNotes,
};
