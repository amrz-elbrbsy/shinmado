/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './components/pages/DashboardPage';
import { SurveyPage } from './components/pages/SurveyPage';
import { InstallationsPage } from './components/pages/InstallationsPage';
import { TechniciansPage } from './components/pages/TechniciansPage';
import { SchedulePage } from './components/pages/SchedulePage';
import { TargetsPage } from './components/pages/TargetsPage';
import { EquipmentPage } from './components/pages/EquipmentPage';
import { LoansPage } from './components/pages/LoansPage';
import { MaterialsPage } from './components/pages/MaterialsPage';
import { MaintenancePage } from './components/pages/MaintenancePage';
import { ReportsPage } from './components/pages/ReportsPage';
import { DocumentationPage } from './components/pages/DocumentationPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { SettingsPage } from './components/pages/SettingsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, authLoading, activePage } = useApp();

  if (authLoading) {
    return <div className="min-h-screen bg-[#0B2546] flex items-center justify-center text-white text-sm">Memeriksa sesi...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'survey':
        return <SurveyPage />;
      case 'pemasangan':
        return <InstallationsPage />;
      case 'teknisi':
        return <TechniciansPage />;
      case 'jadwal':
        return <SchedulePage />;
      case 'target':
        return <TargetsPage />;
      case 'peralatan':
        return <EquipmentPage />;
      case 'peminjaman':
        return <LoansPage />;
      case 'material':
        return <MaterialsPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'laporan':
        return <ReportsPage />;
      case 'dokumentasi':
        return <DocumentationPage />;
      case 'notifikasi':
        return <NotificationsPage />;
      case 'pengaturan':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppShell>{renderActivePage()}</AppShell>;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
