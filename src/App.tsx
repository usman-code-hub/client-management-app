import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserCacheProvider } from './context/UserCacheContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Requirements from './pages/Requirements';
import Tasks from './pages/Tasks';
import Testing from './pages/Testing';
import Fixes from './pages/Fixes';
import Enhancements from './pages/Enhancements';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';
import Forms from './pages/Forms';
import ClientEdit from './pages/ClientEdit.jsx';
import ProjectEdit from './pages/ProjectEdit.jsx';
import TaskEdit from './pages/TaskEdit.jsx';

type CreateRecordTab = 'clients' | 'projects' | 'tasks';

function CreateRecordPage({ tab }: { tab: CreateRecordTab }) {
  const navigate = useNavigate();
  const listPath = `/${tab}`;

  return (
    <Forms
      fixedTab={tab}
      onCancel={() => navigate(listPath)}
      onCreated={() => navigate(listPath)}
    />
  );
}

function ProtectedLayout() {
  const { session } = useAuth();
  const location = useLocation();

  if (session.loading) {
    return (
      <div className="min-h-screen bg-[#08090D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin" />
          <p className="text-sm text-[#94A3B8]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserCacheProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/users" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="/users" replace />} />
              <Route path="users" element={<Users />} />
            </Route>

            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<CreateRecordPage tab="clients" />} />
              <Route path="/clients/:id/edit" element={<ClientEdit />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<CreateRecordPage tab="projects" />} />
              <Route path="/projects/:id/edit" element={<ProjectEdit />} />
              <Route path="/requirements" element={<Requirements />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/new" element={<CreateRecordPage tab="tasks" />} />
              <Route path="/tasks/:id/edit" element={<TaskEdit />} />
              <Route path="/testing" element={<Testing />} />
              <Route path="/fixes" element={<Fixes />} />
              <Route path="/enhancements" element={<Enhancements />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </UserCacheProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
