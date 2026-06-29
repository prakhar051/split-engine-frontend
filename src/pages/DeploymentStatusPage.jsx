import React, { useEffect, useState } from 'react';
import { useHealthStore } from '../store/healthStore';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useNavigate, Link } from 'react-router-dom';
import SystemHealthCard from '../components/admin/SystemHealthCard';
import MetricsCard from '../components/admin/MetricsCard';
import BuildInfoCard from '../components/admin/BuildInfoCard';
import SchedulerStatusCard from '../components/admin/SchedulerStatusCard';
import SocketStatusCard from '../components/admin/SocketStatusCard';
import CacheStatisticsCard from '../components/admin/CacheStatisticsCard';
import DatabaseStatusCard from '../components/admin/DatabaseStatusCard';
import RecentLogsCard from '../components/admin/RecentLogsCard';
import { Shield, RefreshCw, Loader2, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeploymentStatusPage = () => {
  const {
    health,
    ready,
    metrics,
    version,
    fetchAll,
    loading,
    error
  } = useHealthStore();

  const user = useAuthStore((state) => state.user);
  const { groups, getGroups, isLoading: groupsLoading } = useGroupStore();
  const navigate = useNavigate();
  const [secondsToRefresh, setSecondsToRefresh] = useState(15);

  // Load health data on mount
  useEffect(() => {
    fetchAll();
    getGroups();
  }, [fetchAll, getGroups]);

  // Protect route
  useEffect(() => {
    if (!groupsLoading) {
      const isOwnerOrAdmin = groups.some(g => g.myRole === 'OWNER' || g.myRole === 'ADMIN');
      if (!isOwnerOrAdmin) {
        navigate('/');
      }
    }
  }, [groups, groupsLoading, navigate]);

  // Set auto-refresh timer (15 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh((prev) => {
        if (prev <= 1) {
          fetchAll();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchAll]);

  const handleManualRefresh = () => {
    fetchAll();
    setSecondsToRefresh(15);
  };

  if (loading && !health) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 font-medium mt-4">Analyzing System Health Diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center">
              <Shield className="w-6 h-6 text-indigo-500 mr-2 shrink-0" />
              DevOps Observability Panel
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Instance runtime metrics, memory allocation, and database health.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Refreshing in {secondsToRefresh}s
          </span>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-400 text-sm font-semibold"
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SystemHealthCard health={health} ready={ready} />
        <MetricsCard metrics={metrics} />
        <BuildInfoCard version={version} />
        <SchedulerStatusCard metrics={metrics} />
        <SocketStatusCard metrics={metrics} />
        <CacheStatisticsCard metrics={metrics} />
        <DatabaseStatusCard ready={ready} />
        <div className="lg:col-span-2">
          <RecentLogsCard />
        </div>
      </div>
    </div>
  );
};

export default DeploymentStatusPage;
