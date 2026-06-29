import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOfflineStore } from '../../store/offlineStore';
import { useSocketStore } from '../../store/socketStore';
import { useGroupStore } from '../../store/groupStore';
import { LayoutDashboard, User, LogOut, Menu, X, Users, UserPlus, Cpu, Coins, BarChart3, Wallet, TrendingUp, Shield } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

import OfflineBanner from '../pwa/OfflineBanner';
import InstallPWAButton from '../pwa/InstallPWAButton';
import SyncStatus from '../pwa/SyncStatus';
import UpdateAvailableModal from '../pwa/UpdateAvailableModal';
import ConnectionStatus from '../pwa/ConnectionStatus';
import RealtimeNotificationToast from '../ui/RealtimeNotificationToast';
import LiveActivityToast from '../ui/LiveActivityToast';

export const Layout = () => {
  const { user, accessToken, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initializeOfflineStore = useOfflineStore((state) => state.initialize);

  const socketConnect = useSocketStore((state) => state.connect);
  const socketDisconnect = useSocketStore((state) => state.disconnect);

  const { groups, getGroups } = useGroupStore();

  useEffect(() => {
    initializeOfflineStore();
  }, [initializeOfflineStore]);

  useEffect(() => {
    if (isAuthenticated) {
      getGroups();
    }
  }, [isAuthenticated, getGroups]);

  // Synchronize socket connection state with authorization tokens
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketConnect();
    } else {
      socketDisconnect();
    }
    return () => {
      socketDisconnect();
    };
  }, [isAuthenticated, accessToken, socketConnect, socketDisconnect]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const isOwnerOrAdmin = groups.some(g => g.myRole === 'OWNER' || g.myRole === 'ADMIN');

  const navLinks = [
    { to: '/', name: 'Dashboard', icon: LayoutDashboard },
    { to: '/groups', name: 'Groups', icon: Users },
    { to: '/analytics', name: 'Analytics', icon: BarChart3 },
    { to: '/budgets', name: 'Budgets', icon: Wallet },
    { to: '/forecast', name: 'Forecast', icon: TrendingUp },
    { to: '/receipt-scanner', name: 'Receipt Scanner', icon: Cpu },
    { to: '/join-group', name: 'Join Group', icon: UserPlus },
    { to: '/settings/currency', name: 'Currency', icon: Coins },
    { to: '/profile', name: 'Profile', icon: User }
  ];

  if (isOwnerOrAdmin) {
    navLinks.push({ to: '/admin/system', name: 'System Status', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Realtime Action Toasts */}
      <RealtimeNotificationToast />
      <LiveActivityToast />

      {/* Offline Warning Banner */}
      <OfflineBanner />

      {/* Global SW Update Modal */}
      <UpdateAvailableModal />

      <div className="flex-grow flex flex-col md:flex-row min-h-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
              $
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              SplitWise Pro
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <nav className="relative w-72 max-w-xs h-full bg-slate-900 border-r border-slate-850 p-6 flex flex-col justify-between shadow-2xl transition duration-300">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                      $
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">SplitWise Pro</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-205 ${
                            isActive
                              ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col space-y-4 pt-6 border-t border-slate-800">
                {/* Mobile PWA controls */}
                <div className="px-2 space-y-2">
                  <InstallPWAButton />
                  <SyncStatus />
                </div>

                <div className="flex items-center space-x-3 px-2 pt-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-850 flex items-center justify-center text-sm font-bold text-indigo-400">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl text-sm font-medium transition duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col justify-between w-64 bg-slate-900 border-r border-slate-800 p-6 sticky top-0 h-screen shrink-0 z-30">
          <div className="flex flex-col space-y-10">
            <Link to="/" className="flex items-center space-x-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                $
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                SplitWise Pro
              </span>
            </Link>

            <div className="px-2">
              <ConnectionStatus />
            </div>

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                        isActive
                          ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col space-y-4 pt-6 border-t border-slate-800">
            {/* Desktop PWA controls */}
            <div className="px-2 space-y-2">
              <InstallPWAButton />
              <SyncStatus />
            </div>

            <div className="flex items-center space-x-3 px-2 pt-2">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-850 flex items-center justify-center text-sm font-bold text-indigo-400">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl text-sm font-medium transition duration-200 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col min-w-0">
          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-end px-8 py-4 bg-slate-950/20 sticky top-0 z-20 backdrop-blur-md">
            <NotificationBell />
          </header>
          <div className="flex-grow p-6 md:p-8 overflow-y-auto max-w-5xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
