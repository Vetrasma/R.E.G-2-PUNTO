import React, { useState } from 'react';
import { LayoutDashboard, Database, FileText, Settings, ShieldAlert, LogOut, Activity, Users } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Dashboard from './components/Dashboard';
import ConnectionModule from './components/ConnectionModule';
import LogsModule from './components/LogsModule';
import SettingsModule from './components/SettingsModule';
import ProposalsModule from './components/ProposalsModule';
import AgentsModule from './components/AgentsModule';

export default function App() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reg-gray">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl border-t-4 border-reg-blue"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-reg-blue tracking-tight">R.E.G. EUROPA</h1>
            <p className="text-gray-500 mt-2 italic">Institutional Access Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-reg-black mb-1">Username</label>
              <input 
                type="text" 
                className="institutional-input"
                value={loginData.username}
                onChange={e => setLoginData({...loginData, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-reg-black mb-1">Password</label>
              <input 
                type="password" 
                className="institutional-input"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            <button type="submit" className="w-full institutional-btn-primary py-3">
              Authenticate
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Secure Institutional System</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'connections': return <ConnectionModule />;
      case 'agents': return <AgentsModule />;
      case 'proposals': return <ProposalsModule />;
      case 'logs': return <LogsModule />;
      case 'settings': return <SettingsModule />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'ADMIN', 'OPERATOR', 'VIEWER'] },
    { id: 'connections', label: 'Connections', icon: Database, roles: ['SUPERADMIN', 'ADMIN', 'OPERATOR'] },
    { id: 'agents', label: 'AI Agents', icon: Activity, roles: ['SUPERADMIN', 'ADMIN', 'OPERATOR'] },
    { id: 'proposals', label: 'Proposals', icon: FileText, roles: ['SUPERADMIN', 'ADMIN', 'OPERATOR', 'VIEWER'] },
    { id: 'logs', label: 'System Logs', icon: ShieldAlert, roles: ['SUPERADMIN', 'ADMIN'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['SUPERADMIN', 'ADMIN'] },
  ];

  return (
    <div className="flex h-screen bg-reg-gray overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-reg-blue text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold tracking-tighter text-reg-gold">R.E.G. EUROPA</h2>
          <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Institutional Portal</p>
        </div>
        
        <nav className="flex-1 py-4">
          {navItems.filter(item => item.roles.includes(user?.role || '')).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full sidebar-link ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-reg-gold flex items-center justify-center text-reg-blue font-bold text-xs">
              {user?.username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.username}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-tighter">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-reg-blue capitalize">
              {activeTab.replace('-', ' ')}
            </h3>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>System Online</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-right">
              <p className="text-xs font-bold text-reg-blue">{new Date().toLocaleDateString('en-GB')}</p>
              <p className="text-[10px] text-gray-400 uppercase">Server Time</p>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
