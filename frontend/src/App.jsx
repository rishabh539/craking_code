import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GrievanceForm from './pages/GrievanceForm';
import GrievanceList from './pages/GrievanceList';
import ResourceLibrary from './pages/ResourceLibrary';
import ResourceUpload from './pages/ResourceUpload';
import FacultyGrievances from './pages/FacultyGrievances';
import FacultyGrievanceForm from './pages/FacultyGrievanceForm';
import FacultyAnnouncements from './pages/FacultyAnnouncements';
import ManageUsers from './pages/ManageUsers';
import AdminGrievances from './pages/AdminGrievances';
import AdminAnnouncements from './pages/AdminAnnouncements';
import CourseEnrollment from './pages/CourseEnrollment';
import MyEnrollments from './pages/MyEnrollments';
import StudentAttendance from './pages/StudentAttendance';
import AcademicCalendar from './pages/AcademicCalendar';
import MyCourses from './pages/MyCourses';
import AttendanceManagement from './pages/AttendanceManagement';
import AssignmentManagement from './pages/AssignmentManagement';
import CourseManagement from './pages/CourseManagement';
import ResourceApproval from './pages/ResourceApproval';
import EventManagement from './pages/EventManagement';
import FacultyOpportunities from './pages/FacultyOpportunities';
import StudentOpportunities from './pages/StudentOpportunities';
import MyApplications from './pages/MyApplications';
import ScholarsLedger from './pages/ScholarsLedger';
import CourseDetails from './pages/CourseDetails';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/courses/enroll" element={<CourseEnrollment />} />
            <Route path="/student/courses/my" element={<MyEnrollments />} />
            <Route path="/student/courses/:id" element={<CourseDetails />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/calendar" element={<AcademicCalendar />} />
            <Route path="/student/grievances" element={<GrievanceList />} />
            <Route path="/student/submit-grievance" element={<GrievanceForm />} />
            <Route path="/student/resources" element={<ResourceLibrary />} />
            <Route path="/student/opportunities" element={<StudentOpportunities />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/ledger" element={<ScholarsLedger />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/courses" element={<MyCourses />} />
            <Route path="/faculty/announcements" element={<FacultyAnnouncements />} />
            <Route path="/faculty/attendance" element={<AttendanceManagement />} />
            <Route path="/faculty/attendance/:courseId" element={<AttendanceManagement />} />
            <Route path="/faculty/assignments/:courseId" element={<AssignmentManagement />} />
            <Route path="/faculty/resources" element={<ResourceUpload />} />
            <Route path="/faculty/grievances" element={<FacultyGrievances />} />
            <Route path="/faculty/report" element={<FacultyGrievanceForm />} />
            <Route path="/faculty/events" element={<EventManagement />} />
            <Route path="/faculty/opportunities" element={<FacultyOpportunities />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/grievances" element={<AdminGrievances />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/resources" element={<ResourceApproval />} />
            <Route path="/admin/events" element={<EventManagement />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
