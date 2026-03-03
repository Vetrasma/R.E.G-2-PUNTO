import React, { useState, useEffect } from 'react';
import { Plus, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ConnectionModule() {
  const { token } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    user_info: '',
    proxy_user: '',
    auth_type: 'Basic',
    role: '',
    username: 'sma',
    password: '',
    conn_type: 'Oracle',
    details: '',
    hostname: '',
    port: 1521,
    type: 'Service Name',
    service_name: ''
  });

  useEffect(() => {
    fetchConnections();
  }, [token]);

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/connections/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAdding(false);
        fetchConnections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading connections...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-reg-blue uppercase tracking-tight">Institutional Connections</h4>
        <button 
          onClick={() => setIsAdding(true)}
          className="institutional-btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create Connection</span>
        </button>
      </div>

      {isAdding ? (
        <div className="institutional-card p-8">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h5 className="text-lg font-bold text-reg-blue uppercase tracking-widest">Create Connection</h5>
            <p className="text-xs text-gray-400 mt-1">Configure secure institutional database connection</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connection Name */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">Connection Name</label>
                <input 
                  type="text" className="institutional-input" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              {/* User Info */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">User Info</label>
                <input 
                  type="text" className="institutional-input" 
                  value={formData.user_info} onChange={e => setFormData({...formData, user_info: e.target.value})}
                />
              </div>
              {/* Proxy User */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">Proxy User</label>
                <input 
                  type="text" className="institutional-input" 
                  value={formData.proxy_user} onChange={e => setFormData({...formData, proxy_user: e.target.value})}
                />
              </div>
              {/* Authentication Type */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">Authentication Type</label>
                <select 
                  className="institutional-input"
                  value={formData.auth_type} onChange={e => setFormData({...formData, auth_type: e.target.value})}
                >
                  <option>Basic</option>
                  <option>Kerberos</option>
                  <option>OAuth2</option>
                </select>
              </div>
              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">Role</label>
                <input 
                  type="text" className="institutional-input" 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                />
              </div>
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">Username</label>
                <input 
                  type="text" className="institutional-input" 
                  value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">Password</label>
                <input 
                  type="password" className="institutional-input" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              {/* Connection Type */}
              <div>
                <label className="block text-xs font-bold text-reg-black uppercase mb-2">Connection Type</label>
                <select 
                  className="institutional-input"
                  value={formData.conn_type} onChange={e => setFormData({...formData, conn_type: e.target.value})}
                >
                  <option>Oracle</option>
                  <option>PostgreSQL</option>
                  <option>MySQL</option>
                  <option>SQL Server</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h6 className="text-xs font-bold text-reg-blue uppercase tracking-widest mb-6">Advanced Settings</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-reg-black uppercase mb-2">Hostname</label>
                  <input 
                    type="text" className="institutional-input" 
                    value={formData.hostname} onChange={e => setFormData({...formData, hostname: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-reg-black uppercase mb-2">Port</label>
                  <input 
                    type="number" className="institutional-input" 
                    value={formData.port} onChange={e => setFormData({...formData, port: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-reg-black uppercase mb-2">Type</label>
                  <select 
                    className="institutional-input"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option>Service Name</option>
                    <option>SID</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-reg-black uppercase mb-2">Service Name</label>
                  <input 
                    type="text" className="institutional-input" 
                    value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-8">
              <button 
                type="button" onClick={() => setIsAdding(false)}
                className="institutional-btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="button" onClick={handleTest}
                disabled={testing}
                className="institutional-btn-secondary flex items-center space-x-2"
              >
                {testing ? <Loader2 className="animate-spin" size={18} /> : null}
                <span>Test</span>
              </button>
              <button 
                type="button" onClick={handleTest}
                className="institutional-btn-gold"
              >
                Connect
              </button>
              <button 
                type="submit"
                className="institutional-btn-primary"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map(conn => (
            <div key={conn.id} className="institutional-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded bg-reg-blue/5 text-reg-blue">
                  <Database size={24} />
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${conn.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">{conn.status}</span>
                </div>
              </div>
              <h5 className="font-bold text-reg-blue uppercase tracking-tight">{conn.name}</h5>
              <p className="text-xs text-gray-500 mt-1">{conn.hostname}:{conn.port}</p>
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-bold bg-reg-gray px-2 py-1 rounded uppercase">{conn.conn_type}</span>
                <button className="text-xs font-bold text-reg-gold hover:underline">Configure</button>
              </div>
            </div>
          ))}
          {connections.length === 0 && (
            <div className="col-span-full p-12 text-center institutional-card">
              <Database className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 italic">No connections configured yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
