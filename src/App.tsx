import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './components/auth/AuthProvider';
import { CRMProvider } from './contexts/CRMContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CRMPage from './pages/CRM/CRMPage';
import CompaniesPage from './pages/CRM/CompaniesPage';
import ContactsPage from './pages/CRM/ContactsPage';
import DealsPage from './pages/CRM/DealsPage';
import ActivitiesPage from './pages/CRM/ActivitiesPage';
import ChatPage from './pages/Chat/ChatPage';
import EmailPage from './pages/Email/EmailPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import RoutesPage from './pages/Routes/RoutesPage';
import VideoPage from './pages/Video/VideoPage';

// Project Management Pages
import ProjectsPage from './pages/Projects/ProjectsPage';
import ProjectTasksPage from './pages/Projects/ProjectTasksPage';
import ProjectTimelinePage from './pages/Projects/ProjectTimelinePage';
import ProjectMilestonesPage from './pages/Projects/ProjectMilestonesPage';
import ProjectRisksPage from './pages/Projects/ProjectRisksPage';
import ProjectReportsPage from './pages/Projects/ProjectReportsPage';
import ProjectDetailsPage from './pages/Projects/ProjectDetailsPage';

import SettingsPage from './pages/Settings/SettingsPage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CRMProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* CRM routes */}
              <Route path="crm">
                <Route index element={<CRMPage />} />
                <Route path="companies" element={<CompaniesPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="deals" element={<DealsPage />} />
                <Route path="activities" element={<ActivitiesPage />} />
              </Route>
              
              {/* Project Management Routes */}
              <Route path="projects">
                <Route index element={<ProjectsPage />} />
                <Route path=":id" element={<ProjectDetailsPage />} />
                <Route path="tasks" element={<ProjectTasksPage />} />
                <Route path="timeline" element={<ProjectTimelinePage />} />
                <Route path="milestones" element={<ProjectMilestonesPage />} />
                <Route path="risks" element={<ProjectRisksPage />} />
                <Route path="reports" element={<ProjectReportsPage />} />
              </Route>

              <Route path="chat" element={<ChatPage />} />
              <Route path="email" element={<EmailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="video" element={<VideoPage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Fallback for undefined routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </CRMProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;