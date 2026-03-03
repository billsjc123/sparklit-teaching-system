import { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from './components/ui/toaster';
import Layout from './components/common/Layout';
import DashboardPage from './pages/DashboardPage';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import SchedulesPage from './pages/SchedulesPage';
import BillingPage from './pages/BillingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'teachers':
        return <TeachersPage />;
      case 'students':
        return <StudentsPage />;
      case 'schedules':
        return <SchedulesPage />;
      case 'billing':
        return <BillingPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster />
    </AppProvider>
  );
}

export default App;
