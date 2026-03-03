import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LogsModule() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.severity === filter);

  if (loading) return <div>Loading System Logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-reg-blue uppercase tracking-tight text-shadow-sm">Institutional Audit Logs</h4>
        <div className="flex items-center space-x-3">
          <button className="institutional-btn-secondary flex items-center space-x-2 text-xs">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="institutional-card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-reg-blue outline-none w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded px-2 py-2 outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Showing {filteredLogs.length} entries
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-reg-gray/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4 font-bold">Timestamp</th>
                <th className="px-6 py-4 font-bold">Severity</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Reference</th>
                <th className="px-6 py-4 font-bold">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center w-fit space-x-1 ${
                      log.severity === 'ERROR' ? 'bg-red-100 text-red-700' : 
                      log.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.severity === 'ERROR' ? <AlertTriangle size={10} /> : log.severity === 'WARNING' ? <AlertTriangle size={10} /> : <Info size={10} />}
                      <span>{log.severity}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-reg-blue uppercase tracking-tighter">
                    {log.type}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                    {log.agent_ref || log.user_ref || 'SYSTEM'}
                  </td>
                  <td className="px-6 py-4 text-sm text-reg-black font-medium">
                    {log.message}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    No logs matching the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
