const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require('../models/User');
const Grievance = require('../models/Grievance');

// Configure Nodemailer
// NOTE: For demo purposes, we are using Ethereal Email (fake SMTP) or placeholders
// In a real app, you would use SendGrid, Gmail, etc.
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email', // Placeholder
        pass: 'ethereal.pass', // Placeholder
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        // In a real scenario, uncomment below
        // await transporter.sendMail({ from: '"AEGIS Portal" <system@aegisHeaders.com>', to, subject, text });
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Daily Summary Cron Job (Runs every day at 8 AM)
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily grievance summary job...');
    try {
        const admins = await User.find({ role: 'admin' });
        const pendingCount = await Grievance.countDocuments({ status: 'Pending' });
        const highPriorityCount = await Grievance.countDocuments({ priority: 'High', status: { $ne: 'Resolved' } });

        const message = `Daily Summary:\nTotal Pending Grievances: ${pendingCount}\nHigh Priority Unresolved: ${highPriorityCount}\n`;

        for (const admin of admins) {
            await sendEmail(admin.email, 'Daily Grievance Summary', message);
        }
    } catch (error) {
        console.error('Cron job error:', error);
    }
});

// Trigger Alert for High Priority
const triggerHighPriorityAlert = async (grievance) => {
    if (grievance.priority === 'High') {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await sendEmail(admin.email, 'ALERT: High Priority Grievance Submitted', `A new high priority grievance has been submitted.\nTitle: ${grievance.title}\nCategory: ${grievance.category}`);
        }
    }
};

module.exports = {
    triggerHighPriorityAlert,
    sendEmail
};
