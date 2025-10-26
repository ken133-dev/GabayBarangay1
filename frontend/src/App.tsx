import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserRole } from '@/types';

// Auth & Main Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import NotificationPreferences from './pages/NotificationPreferences';

// Health Services Module
import HealthDashboard from './pages/health/HealthDashboard';
import PatientManagement from './pages/health/PatientManagement';
import AppointmentScheduling from './pages/health/AppointmentScheduling';
import HealthRecords from './pages/health/HealthRecords';
import VaccinationTracking from './pages/health/VaccinationTracking';
import CertificateGenerator from './pages/health/CertificateGenerator';
import MyHealthRecords from './pages/health/MyHealthRecords';

// Daycare Module
import DaycareDashboard from './pages/daycare/DaycareDashboard';
import ChildRegistrationForm from './pages/daycare/ChildRegistrationForm';
import StudentRegistration from './pages/daycare/StudentRegistration';
import AttendanceTracking from './pages/daycare/AttendanceTracking';
import MyChildrenProgress from './pages/daycare/MyChildrenProgress';
import ProgressReports from './pages/daycare/ProgressReports';
import EducationalResources from './pages/daycare/EducationalResources';
import LearningMaterials from './pages/daycare/LearningMaterials';

// SK Engagement Module
import SKDashboard from './pages/sk/SKDashboard';
import EventManagement from './pages/sk/EventManagement';
import EventDetails from './pages/sk/EventDetails';
import EventRegistration from './pages/sk/EventRegistration';
import MyEventRegistrations from './pages/sk/MyEventRegistrations';
import AttendanceAnalytics from './pages/sk/AttendanceAnalytics';
import SKAnalytics from './pages/sk/SKAnalytics';

// Admin Module
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PendingApprovals from './pages/admin/PendingApprovals';
import SystemSettings from './pages/admin/SystemSettings';
import AuditLogs from './pages/admin/AuditLogs';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import RoleManagement from './pages/admin/RoleManagement';
import BackupManagement from './pages/admin/BackupManagement';
import BroadcastManagement from './pages/admin/BroadcastManagement';

// Public Pages
import Homepage from './pages/public/Homepage';
import PublicEvents from './pages/public/PublicEvents';
import Announcements from './pages/public/Announcements';
import Contact from './pages/public/Contact';
import Services from './pages/public/Services';
import AboutBarangay from './pages/public/AboutBarangay';

// Reports Module
import ReportsDashboard from './pages/reports/ReportsDashboard';
import HealthReports from './pages/reports/HealthReports';
import DaycareReports from './pages/reports/DaycareReports';
import SKReports from './pages/reports/SKReports';
import CrossModuleAnalytics from './pages/reports/CrossModuleAnalytics';
import HealthStats from './pages/reports/HealthStats';


function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/events/public" element={<PublicEvents />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<AboutBarangay />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/notifications/preferences" element={
              <ProtectedRoute>
                <NotificationPreferences />
              </ProtectedRoute>
            } />

            {/* Health Services Module - Protected for BHW roles */}
            <Route path="/health" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW, UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN]}>
                <HealthDashboard />
              </ProtectedRoute>
            } />
            <Route path="/health/patients" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW, UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN]}>
                <PatientManagement />
              </ProtectedRoute>
            } />
            <Route path="/health/appointments" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW, UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN]}>
                <AppointmentScheduling />
              </ProtectedRoute>
            } />
            <Route path="/health/records" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW, UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN, UserRole.PARENT_RESIDENT]}>
                <HealthRecords />
              </ProtectedRoute>
            } />
            <Route path="/health/my-records" element={
              <ProtectedRoute allowedRoles={[UserRole.PARENT_RESIDENT]}>
                <MyHealthRecords />
              </ProtectedRoute>
            } />
            <Route path="/health/vaccinations" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW, UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN]}>
                <VaccinationTracking />
              </ProtectedRoute>
            } />
            <Route path="/health/certificates" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW, UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN]}>
                <CertificateGenerator />
              </ProtectedRoute>
            } />

            {/* Daycare Module - Protected for Daycare roles */}
            <Route path="/daycare" element={
              <ProtectedRoute allowedRoles={[UserRole.DAYCARE_STAFF, UserRole.DAYCARE_TEACHER, UserRole.SYSTEM_ADMIN, UserRole.PARENT_RESIDENT]}>
                <DaycareDashboard />
              </ProtectedRoute>
            } />
            <Route path="/daycare/registration" element={
              <ProtectedRoute allowedRoles={[UserRole.PARENT_RESIDENT]}>
                <ChildRegistrationForm />
              </ProtectedRoute>
            } />
            <Route path="/daycare/registrations" element={
              <ProtectedRoute allowedRoles={[UserRole.DAYCARE_STAFF, UserRole.DAYCARE_TEACHER, UserRole.SYSTEM_ADMIN, UserRole.PARENT_RESIDENT]}>
                <StudentRegistration />
              </ProtectedRoute>
            } />
            <Route path="/daycare/attendance" element={
              <ProtectedRoute allowedRoles={[UserRole.DAYCARE_STAFF, UserRole.DAYCARE_TEACHER, UserRole.SYSTEM_ADMIN]}>
                <AttendanceTracking />
              </ProtectedRoute>
            } />
            <Route path="/daycare/progress" element={
              <ProtectedRoute allowedRoles={[UserRole.PARENT_RESIDENT]}>
                <MyChildrenProgress />
              </ProtectedRoute>
            } />
            <Route path="/daycare/progress-reports" element={
              <ProtectedRoute allowedRoles={[UserRole.DAYCARE_STAFF, UserRole.DAYCARE_TEACHER, UserRole.SYSTEM_ADMIN, UserRole.PARENT_RESIDENT]}>
                <ProgressReports />
              </ProtectedRoute>
            } />
            <Route path="/daycare/resources" element={
              <ProtectedRoute allowedRoles={[UserRole.PARENT_RESIDENT]}>
                <EducationalResources />
              </ProtectedRoute>
            } />
            <Route path="/daycare/materials" element={
              <ProtectedRoute allowedRoles={[UserRole.DAYCARE_STAFF, UserRole.DAYCARE_TEACHER, UserRole.SYSTEM_ADMIN, UserRole.PARENT_RESIDENT]}>
                <LearningMaterials />
              </ProtectedRoute>
            } />

            {/* SK Engagement Module - Protected for SK roles */}
            <Route path="/sk" element={
              <ProtectedRoute allowedRoles={[UserRole.SK_OFFICER, UserRole.SK_CHAIRMAN, UserRole.SYSTEM_ADMIN]}>
                <SKDashboard />
              </ProtectedRoute>
            } />
            <Route path="/sk/events" element={
              <ProtectedRoute allowedRoles={[UserRole.SK_OFFICER, UserRole.SK_CHAIRMAN, UserRole.SYSTEM_ADMIN]}>
                <EventManagement />
              </ProtectedRoute>
            } />
            <Route path="/sk/events/:id" element={
              <ProtectedRoute allowedRoles={[UserRole.SK_OFFICER, UserRole.SK_CHAIRMAN, UserRole.SYSTEM_ADMIN]}>
                <EventDetails />
              </ProtectedRoute>
            } />
            <Route path="/sk/event-registration" element={
              <ProtectedRoute>
                <EventRegistration />
              </ProtectedRoute>
            } />
            <Route path="/events/my-registrations" element={
              <ProtectedRoute allowedRoles={[UserRole.PARENT_RESIDENT]}>
                <MyEventRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/sk/attendance" element={
              <ProtectedRoute allowedRoles={[UserRole.SK_OFFICER, UserRole.SK_CHAIRMAN, UserRole.SYSTEM_ADMIN]}>
                <AttendanceAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/sk/analytics" element={
              <ProtectedRoute allowedRoles={[UserRole.SK_CHAIRMAN, UserRole.SYSTEM_ADMIN]}>
                <SKAnalytics />
              </ProtectedRoute>
            } />

            {/* Admin Module - Protected for Admin roles */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN, UserRole.BARANGAY_OFFICIAL]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN]}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/pending" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN]}>
                <PendingApprovals />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN]}>
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings/audit-logs" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN]}>
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/announcements" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN]}>
                <AnnouncementManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/roles" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN]}>
                <RoleManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings/backup" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN]}>
                <BackupManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings/notifications" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN]}>
                <BroadcastManagement />
              </ProtectedRoute>
            } />

            {/* Reports Module - Protected for authenticated users */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reports/health" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW, UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN, UserRole.BARANGAY_OFFICIAL]}>
                <HealthReports />
              </ProtectedRoute>
            } />
            <Route path="/reports/daycare" element={
              <ProtectedRoute allowedRoles={[UserRole.DAYCARE_STAFF, UserRole.DAYCARE_TEACHER, UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN, UserRole.BARANGAY_OFFICIAL]}>
                <DaycareReports />
              </ProtectedRoute>
            } />
            <Route path="/reports/sk" element={
              <ProtectedRoute allowedRoles={[UserRole.SK_OFFICER, UserRole.SK_CHAIRMAN, UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN, UserRole.BARANGAY_OFFICIAL]}>
                <SKReports />
              </ProtectedRoute>
            } />
            <Route path="/reports/analytics" element={
              <ProtectedRoute allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN, UserRole.BARANGAY_OFFICIAL]}>
                <CrossModuleAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/reports/health/stats" element={
              <ProtectedRoute allowedRoles={[UserRole.BHW_COORDINATOR, UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN, UserRole.BARANGAY_OFFICIAL]}>
                <HealthStats />
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
