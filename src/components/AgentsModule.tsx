import React, { useState } from 'react';
import { Activity, Play, Pause, RefreshCw, Shield, Zap, FileText, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AgentsModule() {
  const { token } = useAuth();
  const [running, setRunning] = useState<Record<string, boolean>>({
    detection: true,
    viability: true,
    documentation: false,
    supervision: true
  });
  const [logs, setLogs] = useState<string[]>([
    "[18:30:01] Detection Agent: Scanning Catastro España API...",
    "[18:30:05] Detection Agent: 3 new opportunities identified in Valencia.",
    "[18:30:10] Viability Agent: Calculating index for Opportunity #442...",
    "[18:30:12] Viability Agent: Index 82/100. High potential detected.",
    "[18:30:15] Supervision Agent: Adjusting detection thresholds for Portugal region."
  ]);

  const toggleAgent = (id: string) => {
    setRunning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const runManual = async (agent: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Manual trigger: ${agent} started...`]);
    const endpointMap: Record<string, string> = {
      'Detection': '/api/agents/detect',
      'Viability': '/api/agents/viability',
      'Documentation': '/api/agents/proposals',
      'Supervision': '/api/agents/supervision'
    };

    const endpoint = endpointMap[agent];
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          // For viability and proposals, we'd normally need an ID, but for the manual trigger demo we'll let the agent handle it or use a dummy
          body: JSON.stringify({ opportunity_id: 1, viability_score: 85 })
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${agent} Agent: ${data.message || 'Operation successful.'}`]);
        } else {
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${agent} Agent: Operation failed.`]);
        }
      } catch (err) {
        console.error(err);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${agent} Agent: Connection error.`]);
      }
    }
  };

  const agents = [
    { id: 'detection', name: 'Detection Agent', icon: Search, desc: 'Scans public APIs for real estate opportunities.' },
    { id: 'viability', name: 'Viability Agent', icon: Zap, desc: 'Calculates institutional viability index (0-100).' },
    { id: 'documentation', name: 'Documentation Agent', icon: FileText, desc: 'Generates PDF-ready institutional proposals.' },
    { id: 'supervision', name: 'Supervision Agent', icon: Shield, desc: 'Monitors performance and adjusts system thresholds.' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-reg-blue uppercase tracking-tight">Autonomous AI Agents</h4>
        <div className="flex items-center space-x-3">
          <button className="institutional-btn-secondary flex items-center space-x-2 text-xs">
            <RefreshCw size={14} />
            <span>Restart All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="institutional-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded bg-reg-blue/5 ${running[agent.id] ? 'text-reg-gold' : 'text-gray-400'}`}>
                  <agent.icon size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-reg-blue uppercase tracking-tight">{agent.name}</h5>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    Status: <span className={running[agent.id] ? 'text-green-600' : 'text-red-600'}>
                      {running[agent.id] ? 'Running' : 'Paused'}
                    </span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => toggleAgent(agent.id)}
                className={`p-2 rounded-full transition-colors ${running[agent.id] ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {running[agent.id] ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{agent.desc}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center space-x-2">
                <Activity size={14} className="text-reg-gold" />
                <span className="text-[10px] font-bold text-reg-blue uppercase">Efficiency: 98.2%</span>
              </div>
              <button 
                onClick={() => runManual(agent.name.split(' ')[0])}
                className="text-xs font-bold text-reg-blue hover:text-reg-gold transition-colors uppercase tracking-widest"
              >
                Trigger Manual Scan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Activity Console */}
      <div className="institutional-card bg-reg-black text-green-400 font-mono p-6 rounded-lg shadow-2xl border-l-4 border-reg-gold">
        <div className="flex items-center justify-between mb-4 border-b border-green-900/30 pb-2">
          <h6 className="text-xs font-bold uppercase tracking-widest">Real-Time Agent Console</h6>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
        <div className="space-y-1 h-48 overflow-y-auto text-[11px] scrollbar-thin scrollbar-thumb-green-900">
          {logs.map((log, i) => (
            <div key={i} className="flex space-x-2">
              <span className="opacity-50">[{i.toString().padStart(3, '0')}]</span>
              <span>{log}</span>
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
}
