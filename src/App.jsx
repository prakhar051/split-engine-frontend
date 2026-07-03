import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute, PublicOnlyRoute } from './routes/RouteGuards';
import { Layout } from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import InvitationAcceptPage from './pages/InvitationAcceptPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import JoinGroupPage from './pages/JoinGroupPage';
import ExpensesPage from './pages/ExpensesPage';
import CreateExpensePage from './pages/CreateExpensePage';
import ExpenseDetailsPage from './pages/ExpenseDetailsPage';
import EditExpensePage from './pages/EditExpensePage';
import ReceiptScannerPage from './pages/ReceiptScannerPage';
import SettlementsPage from './pages/SettlementsPage';
import SettlementDetailsPage from './pages/SettlementDetailsPage';
import ActivityPage from './pages/ActivityPage';
import NotificationPage from './pages/NotificationPage';
import RecurringExpensesPage from './pages/RecurringExpensesPage';
import CreateRecurringExpensePage from './pages/CreateRecurringExpensePage';
import EditRecurringExpensePage from './pages/EditRecurringExpensePage';
import SettingsCurrencyPage from './pages/SettingsCurrencyPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetPage from './pages/BudgetPage';
import ForecastPage from './pages/ForecastPage';
import GroupAdminPage from './pages/GroupAdminPage';
import DeploymentStatusPage from './pages/DeploymentStatusPage';


function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Open Routes (Guest & Auth Users) */}
        <Route path="/invitations/:token" element={<InvitationAcceptPage />} />

        {/* Public-only Routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Routes inside Global Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
            <Route path="/groups/:groupId/admin" element={<GroupAdminPage />} />
            <Route path="/groups/:groupId/expenses" element={<ExpensesPage />} />

            <Route path="/groups/:groupId/expenses/new" element={<CreateExpensePage />} />
            <Route path="/groups/:groupId/expenses/:expenseId" element={<ExpenseDetailsPage />} />
            <Route path="/groups/:groupId/expenses/:expenseId/edit" element={<EditExpensePage />} />
            
            {/* Recurring schedules routes */}
            <Route path="/groups/:groupId/recurring" element={<RecurringExpensesPage />} />
            <Route path="/groups/:groupId/recurring/new" element={<CreateRecurringExpensePage />} />
            <Route path="/groups/:groupId/recurring/:templateId/edit" element={<EditRecurringExpensePage />} />

            <Route path="/groups/:groupId/settlements" element={<SettlementsPage />} />
            <Route path="/groups/:groupId/settlements/:settlementId" element={<SettlementDetailsPage />} />
            <Route path="/groups/:groupId/activity" element={<ActivityPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/join-group" element={<JoinGroupPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="/settings/currency" element={<SettingsCurrencyPage />} />
            <Route path="/receipt-scanner" element={<ReceiptScannerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/budgets" element={<BudgetPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/admin/system" element={<DeploymentStatusPage />} />
          </Route>
        </Route>


        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

