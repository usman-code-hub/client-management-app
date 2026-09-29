import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import {
  LayoutDashboard, Users, Briefcase, ClipboardList, CheckSquare, Search as SearchIcon,
  TestTube, Wrench, Sparkles, Activity as ActivityIcon, Settings, Menu, X
} from 'lucide-react';
import { getClients } from '../../services/clients';
import { getProjects } from '../../services/projects';
import { getTasks } from '../../services/tasks';

type SearchResult = {
  id: string;
  label: string;
  detail: string;
  keywords: string;
  type: 'Client' | 'Project' | 'Task';
  to: string;
};

const nav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', to: '/clients', icon: Users },
  { label: 'Projects', to: '/projects', icon: Briefcase },
  { label: 'Requirements', to: '/requirements', icon: ClipboardList },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Testing', to: '/testing', icon: TestTube },
  { label: 'Fixes', to: '/fixes', icon: Wrench },
  { label: 'Enhancements', to: '/enhancements', icon: Sparkles },
  { label: 'Activity', to: '/activity', icon: ActivityIcon },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchLoaded, setSearchLoaded] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const pageTitle = nav.find((item) => item.to === location.pathname)?.label ?? 'Dashboard';

  const loadSearchResults = async () => {
    setSearchOpen(true);
    if (searchLoaded || searchLoading) return;

    setSearchLoading(true);
    try {
      const [clients, projects, tasks] = await Promise.all([
        getClients(),
        getProjects(),
        getTasks(),
      ]);
      setSearchResults([
        ...clients.map((client: any) => ({
          id: String(client.id),
          label: client.name || client.company || 'Untitled client',
          detail: client.email || client.status || 'Client',
          keywords: [client.name, client.company, client.email, client.status].filter(Boolean).join(' ').toLowerCase(),
          type: 'Client' as const,
          to: '/clients',
        })),
        ...projects.map((project: any) => ({
          id: String(project.id),
          label: project.name || 'Untitled project',
          detail: project.status || 'Project',
          keywords: [project.name, project.status, project.description].filter(Boolean).join(' ').toLowerCase(),
          type: 'Project' as const,
          to: '/projects',
        })),
        ...tasks.map((task: any) => ({
          id: String(task.id),
          label: task.title || 'Untitled task',
          detail: task.status || 'Task',
          keywords: [task.title, task.status, task.priority, task.description].filter(Boolean).join(' ').toLowerCase(),
          type: 'Task' as const,
          to: '/tasks',
        })),
      ]);
      setSearchLoaded(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleResults = searchResults
    .filter((result) => !normalizedQuery || result.keywords.includes(normalizedQuery))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F8FAFC] font-sans antialiased selection:bg-[#8B5CF6] selection:text-white relative overflow-x-hidden">
      {/* Background ambient glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/15 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6366F1]/10 blur-[100px] pointer-events-none z-0" />

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 max-w-[85vw] flex-col border-r border-[#242936]/60 bg-gradient-to-b from-[#0D1017]/95 to-[#0A0D12] shadow-[4px_0_40px_-10px_rgba(139,92,246,0.15)] backdrop-blur-xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[#242936]/40 px-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <span className="text-white text-xs font-extrabold">◈</span>
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-[#F8FAFC] leading-none">CLIENT<br/>COMMAND</span>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={toggleSidebar}
            className="ml-auto rounded-lg p-2 text-[#94A3B8] hover:bg-[#151923] hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                  ? 'bg-[rgba(139,92,246,0.14)] text-[#C4B5FD] shadow-[0_0_20px_rgba(139,92,246,0.15)] border border-[#8B5CF6]/30'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151923]/60 hover:translate-x-0.5'}`
              )}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                  >
                    <item.icon size={18} strokeWidth={2.2} />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-[#242936]/30 text-[11px] text-[#64748B] tracking-wide uppercase">
          Auth-free internal system
        </div>
      </aside>

      <div
        className="relative z-10 ml-0 flex min-h-screen min-w-0 flex-col md:ml-64"
      >
        <header
          className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-[#242936]/40 bg-[#08090D]/60 px-4 backdrop-blur-2xl md:px-6"
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#151923] hover:text-white md:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="truncate text-base font-bold tracking-tight text-[#F8FAFC]">{pageTitle}</h1>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative w-80 max-w-[45vw] min-w-0">
              <SearchIcon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => { void loadSearchResults(); }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setSearchOpen(false);
                }}
                placeholder="Search clients, projects, tasks..."
                aria-label="Search clients, projects, and tasks"
                aria-expanded={searchOpen}
                className="h-10 w-full rounded-xl border border-[#242936]/60 bg-[#11141B]/80 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder:text-[#64748B] shadow-inner shadow-black/20 backdrop-blur-md outline-none focus:border-[#8B5CF6]/60"
              />
              {searchOpen && (
                <div className="absolute right-0 top-12 z-50 max-h-96 w-full min-w-0 overflow-y-auto rounded-xl border border-[#242936] bg-[#11141B] py-2 shadow-2xl md:min-w-80">
                  {searchLoading ? (
                    <p className="px-4 py-3 text-sm text-[#94A3B8]">Loading records...</p>
                  ) : visibleResults.length ? (
                    visibleResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(result.to);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-[#1A1F29]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-[#F8FAFC]">{result.label}</span>
                          <span className="block truncate text-xs text-[#64748B]">{result.detail}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-[#A78BFA]">{result.type}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-[#94A3B8]">
                      {normalizedQuery ? 'No matching records.' : 'No records found.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="relative min-w-0 flex-1 bg-transparent p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
