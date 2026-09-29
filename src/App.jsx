import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Requirements from './pages/Requirements';
import Fixes from './pages/Fixes';
import Activity from './pages/Activity';
import Forms from './pages/Forms';
import ClientEdit from './pages/ClientEdit';
import ProjectEdit from './pages/ProjectEdit';
import TaskEdit from './pages/TaskEdit';

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#0b0d12] text-white">
        <nav className="w-64 bg-[#11141b] border-r border-[#242833] p-6 flex flex-col gap-8 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-linear-to-br from-[#6d4aff] to-[#925cff] rounded-lg"></div>
            <h1 className="text-lg font-bold tracking-tight">Command Center</h1>
          </div>
          <div className="flex flex-col gap-1">
            <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1f29] transition-colors text-gray-400 hover:text-white">Dashboard</Link>
            <p className="text-[10px] uppercase text-gray-500 font-bold px-2 mb-2 mt-2">Core</p>
            <Link to="/clients" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1f29] transition-colors text-gray-400 hover:text-white">Clients</Link>
            <Link to="/projects" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1f29] transition-colors text-gray-400 hover:text-white">Projects</Link>
            <Link to="/tasks" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1f29] transition-colors text-gray-400 hover:text-white">Tasks</Link>
            <p className="text-[10px] uppercase text-gray-500 font-bold px-2 mb-2 mt-4">Workflow</p>
            <Link to="/requirements" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1f29] transition-colors text-gray-400 hover:text-white">Requirements</Link>
            <Link to="/fixes" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1f29] transition-colors text-gray-400 hover:text-white">Fixes</Link>
            <p className="text-[10px] uppercase text-gray-500 font-bold px-2 mb-2 mt-4">Audit</p>
            <Link to="/activity" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1f29] transition-colors text-gray-400 hover:text-white">Activity Log</Link>
          </div>
        </nav>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id/edit" element={<ClientEdit />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id/edit" element={<ProjectEdit />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id/edit" element={<TaskEdit />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/fixes" element={<Fixes />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/clients/new" element={<Forms fixedTab="clients" />} />
            <Route path="/projects/new" element={<Forms fixedTab="projects" />} />
            <Route path="/tasks/new" element={<Forms fixedTab="tasks" />} />
            <Route path="/forms" element={<Forms />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
