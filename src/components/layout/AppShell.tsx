import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  Settings,
  X,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';
import { useApp, PageId } from '../../context/AppContext';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { activePage, navigate } = useApp();

  const mobileBottomItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'jadwal', label: 'Jadwal', icon: <Calendar className="w-4 h-4" /> },
    { id: 'teknisi', label: 'Teknisi', icon: <Users className="w-4 h-4" /> },
    { id: 'peralatan', label: 'Alat', icon: <Wrench className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Menu', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col antialiased text-slate-800">
      {/* Toast notifications container */}
      <ToastContainer />

      <div className="flex flex-1 min-h-screen">
        {/* DESKTOP SIDEBAR (Fixed 260px) */}
        <div className="hidden lg:block lg:w-[260px] shrink-0 h-screen sticky top-0 z-40">
          <Sidebar />
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Slide-in Drawer */}
            <div className="relative w-[280px] max-w-[85vw] h-full bg-white shadow-2xl z-10 flex flex-col">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar onItemClick={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* MAIN COLUMN */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 sm:pb-0">
          {/* TOPBAR */}
          <Topbar onMenuToggle={() => setIsMobileSidebarOpen(true)} />

          {/* PAGE CONTENT CONTAINER */}
          <main className="flex-1 w-full px-6 lg:px-8 py-6 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex items-center justify-around">
        {mobileBottomItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-3 rounded-xl transition-colors cursor-pointer select-none ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
