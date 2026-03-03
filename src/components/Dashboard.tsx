import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, FileCheck, AlertCircle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64">Loading Dashboard Data...</div>;

  const kpis = [
    { label: 'Total Opportunities', value: stats?.totalOpportunities?.count || 0, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Active Proposals', value: stats?.totalProposals?.count || 0, icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50', trend: '+5%' },
    { label: 'Active Connections', value: stats?.activeConnections?.count || 0, icon: TrendingUp, color: 'text-reg-gold', bg: 'bg-yellow-50', trend: 'Stable' },
    { label: 'System Alerts', value: stats?.recentLogs?.filter((l: any) => l.severity === 'ERROR').length || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', trend: '-2%' },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="institutional-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={kpi.color} size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${kpi.trend.startsWith('+') ? 'bg-green-100 text-green-700' : kpi.trend.startsWith('-') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
              <h4 className="text-3xl font-bold text-reg-blue mt-1">{kpi.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Logs */}
        <div className="lg:col-span-2 institutional-card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h5 className="font-bold text-reg-blue uppercase tracking-tight">Recent Activity Logs</h5>
            <button className="text-xs font-bold text-reg-gold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentLogs?.map((log: any) => (
              <div key={log.id} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${log.severity === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-reg-black">{log.message}</p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">
                    {new Date(log.timestamp).toLocaleString()} • {log.type} • {log.agent_ref || log.user_ref}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${log.severity === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {log.severity}
                </span>
              </div>
            ))}
            {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
              <div className="p-8 text-center text-gray-400 italic">No recent activity found.</div>
            )}
          </div>
        </div>

        {/* Agent Status */}
        <div className="institutional-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h5 className="font-bold text-reg-blue uppercase tracking-tight">Agent Status</h5>
          </div>
          <div className="p-6 space-y-6">
            {['Detection Agent', 'Viability Agent', 'Documentation Agent', 'Supervision Agent'].map((agent, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-reg-gray flex items-center justify-center text-reg-blue">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-reg-blue">{agent}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Autonomous Mode</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-reg-blue/5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-reg-blue uppercase">Global Efficiency</p>
              <p className="text-xs font-bold text-reg-blue">94%</p>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-reg-gold" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
