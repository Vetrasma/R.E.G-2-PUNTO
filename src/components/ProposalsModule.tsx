import React, { useState } from 'react';
import { FileText, Download, Eye, Send, CheckCircle } from 'lucide-react';

export default function ProposalsModule() {
  const [proposals] = useState([
    { id: 1, title: 'Commercial Activation - Madrid Central', score: 88, date: '2024-03-01', status: 'Approved' },
    { id: 2, title: 'Residential Redevelopment - Lisbon Waterfront', score: 92, date: '2024-02-28', status: 'Pending' },
    { id: 3, title: 'Industrial Logistics Hub - Lyon', score: 74, date: '2024-02-25', status: 'Draft' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-reg-blue uppercase tracking-tight">Investment Proposals</h4>
        <button className="institutional-btn-primary">Generate Batch</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {proposals.map(proposal => (
          <div key={proposal.id} className="institutional-card p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded bg-reg-gray flex items-center justify-center text-reg-blue">
                <FileText size={24} />
              </div>
              <div>
                <h5 className="font-bold text-reg-blue uppercase tracking-tight">{proposal.title}</h5>
                <p className="text-xs text-gray-400 mt-1">Generated on {proposal.date} • Viability: <span className="font-bold text-reg-gold">{proposal.score}%</span></p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                  proposal.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                  proposal.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {proposal.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button title="View" className="p-2 text-gray-400 hover:text-reg-blue transition-colors"><Eye size={18} /></button>
                <button title="Download PDF" className="p-2 text-gray-400 hover:text-reg-blue transition-colors"><Download size={18} /></button>
                <button title="Send Email" className="p-2 text-gray-400 hover:text-reg-blue transition-colors"><Send size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
