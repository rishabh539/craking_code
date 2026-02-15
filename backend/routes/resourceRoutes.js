const express = require('express');
const router = express.Router();
const {
    uploadResource,
    getResources,
    getResourceById,
    approveResource,
    toggleBookmark,
    getMyBookmarks,
    incrementDownload,
    updateResource,
    deleteResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/resourceUpload');

router.post('/', protect, upload.single('resourceFile'), uploadResource);
router.get('/', protect, getResources);
router.get('/bookmarks/my', protect, getMyBookmarks);
router.get('/:id', protect, getResourceById);
router.put('/:id/approve', protect, authorize('admin'), approveResource);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/download', protect, incrementDownload);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
