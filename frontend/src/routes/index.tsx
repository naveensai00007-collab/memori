import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LandingPage } from '../pages/LandingPage';
import { AuthPage } from '../pages/AuthPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LocationsPage } from '../pages/LocationsPage';
import { RemindersPage } from '../pages/RemindersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AppBar } from '../components/layout/AppBar';
import { Sidebar } from '../components/layout/Sidebar';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { Footer } from '../components/layout/Footer';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-memori-bg text-memori-text flex flex-col selection:bg-accent/30">
      <OfflineBanner />
      <AppBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Authenticated routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/locations"
        element={
          <ProtectedLayout>
            <LocationsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reminders"
        element={
          <ProtectedLayout>
            <RemindersPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
