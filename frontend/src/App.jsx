import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GrievanceForm from './pages/GrievanceForm';
import GrievanceList from './pages/GrievanceList';
import NotesList from './pages/NotesList';
import NotesUpload from './pages/NotesUpload';
import FacultyGrievances from './pages/FacultyGrievances';
import ManageUsers from './pages/ManageUsers';
import AdminGrievances from './pages/AdminGrievances';
import AdminAnnouncements from './pages/AdminAnnouncements';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/grievances" element={<GrievanceList />} />
          <Route path="/student/submit-grievance" element={<GrievanceForm />} />
          <Route path="/student/notes" element={<NotesList />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/faculty/notes" element={<NotesUpload />} />
          {/* Note: Faculty dashboard might link to grievances, or we add a specific route */}
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/grievances" element={<AdminGrievances />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
