import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CRMPage from './pages/CRM/CRMPage';
import ChatPage from './pages/Chat/ChatPage';
import EmailPage from './pages/Email/EmailPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import RoutesPage from './pages/Routes/RoutesPage';
import VideoPage from './pages/Video/VideoPage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import SettingsPage from './pages/Settings/SettingsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="crm" element={<CRMPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="email" element={<EmailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="video" element={<VideoPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Fallback for undefined routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;