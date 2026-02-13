const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/grievances', require('./routes/grievanceRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/courses', require('./routes/noteRoutes')); // Typo validation? No, sticking to plan.
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// Routes will be added here

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
