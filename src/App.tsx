import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import SchedulesPage from './pages/SchedulesPage';
import BillingPage from './pages/BillingPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherProfile from './pages/TeacherProfile';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // 加载中显示loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Routes>
        {/* 登录页面 */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />

        {/* 受保护的路由 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/teachers" element={<TeachersPage />} />
                  <Route path="/students" element={<StudentsPage />} />
                  <Route path="/schedules" element={<SchedulesPage />} />
                  <Route path="/billing" element={<BillingPage />} />
                  <Route path="/admin/users" element={<AdminDashboard />} />
                  <Route path="/profile" element={<TeacherProfile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </AppProvider>
  );
}

export default App;
