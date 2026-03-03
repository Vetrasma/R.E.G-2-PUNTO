import React, { useState, useEffect } from 'react';
import { Globe, Shield, Zap, Bell, Lock, FileText, Mail, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsModule() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      alert('Settings updated successfully');
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading Institutional Settings...</div>;

  const sections = [
    { id: 'general', label: 'General Configuration', icon: Globe },
    { id: 'agents', label: 'Agent Parameters', icon: Zap },
    { id: 'api_keys', label: 'API Integrations & Keys', icon: Lock },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'notifications', label: 'Email & Alerts', icon: Bell },
  ];

  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-reg-blue uppercase tracking-tight">Institutional Settings</h4>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="institutional-btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors border ${
                activeSection === section.id 
                ? 'bg-reg-blue text-white border-reg-blue' 
                : 'text-reg-blue hover:bg-white border-transparent hover:border-reg-blue/10'
              }`}
            >
              <section.icon size={18} className={activeSection === section.id ? 'text-reg-gold' : 'text-reg-gold'} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeSection === 'general' && (
            <div className="institutional-card p-8">
              <h5 className="text-sm font-bold text-reg-blue uppercase tracking-widest mb-6 flex items-center space-x-2">
                <Globe size={16} className="text-reg-gold" />
                <span>Countries Enabled</span>
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Spain', 'Portugal', 'France', 'Germany', 'Italy', 'UK', 'Switzerland', 'Denmark', 'Belgium', 'Netherlands'].map(country => (
                  <label key={country} className="flex items-center space-x-3 p-3 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-reg-blue rounded border-gray-300 focus:ring-reg-blue" 
                      checked={settings.countries_enabled?.includes(country)}
                      onChange={(e) => {
                        const current = settings.countries_enabled ? JSON.parse(settings.countries_enabled) : [];
                        const updated = e.target.checked 
                          ? [...current, country] 
                          : current.filter((c: string) => c !== country);
                        setSettings({...settings, countries_enabled: JSON.stringify(updated)});
                      }}
                    />
                    <span className="text-sm font-medium text-reg-black">{country}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'agents' && (
            <div className="institutional-card p-8">
              <h5 className="text-sm font-bold text-reg-blue uppercase tracking-widest mb-6 flex items-center space-x-2">
                <Zap size={16} className="text-reg-gold" />
                <span>Viability Thresholds</span>
              </h5>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Minimum Viability Index (0-100)</label>
                    <span className="text-xs font-bold text-reg-blue">{settings.viability_threshold || 70}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-reg-blue"
                    value={settings.viability_threshold || 70}
                    onChange={e => setSettings({...settings, viability_threshold: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Scan Frequency</label>
                    <select className="institutional-input" value={settings.scan_frequency} onChange={e => setSettings({...settings, scan_frequency: e.target.value})}>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Parallel Agents</label>
                    <input type="number" className="institutional-input" defaultValue={5} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api_keys' && (
            <div className="institutional-card p-8">
              <h5 className="text-sm font-bold text-reg-blue uppercase tracking-widest mb-6 flex items-center space-x-2">
                <Lock size={16} className="text-reg-gold" />
                <span>API Integrations & Keys</span>
              </h5>
              <p className="text-xs text-gray-400 mb-8 italic">Sensitive keys are encrypted at rest and masked in the UI for security.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Idealista API Key</label>
                    <input 
                      type="password" 
                      className="institutional-input" 
                      value={settings.IDEALISTA_API_KEY || ""} 
                      onChange={e => setSettings({...settings, IDEALISTA_API_KEY: e.target.value})}
                      placeholder="Enter API Key"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Idealista Secret</label>
                    <input 
                      type="password" 
                      className="institutional-input" 
                      value={settings.IDEALISTA_SECRET || ""} 
                      onChange={e => setSettings({...settings, IDEALISTA_SECRET: e.target.value})}
                      placeholder="Enter Secret"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dados.gov.pt API Key</label>
                    <input 
                      type="password" 
                      className="institutional-input" 
                      value={settings.DADOS_GOV_PT_API_KEY || ""} 
                      onChange={e => setSettings({...settings, DADOS_GOV_PT_API_KEY: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Etalab API Key</label>
                    <input 
                      type="password" 
                      className="institutional-input" 
                      value={settings.ETALAB_API_KEY || ""} 
                      onChange={e => setSettings({...settings, ETALAB_API_KEY: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GovData.de API Key</label>
                    <input 
                      type="password" 
                      className="institutional-input" 
                      value={settings.GOVDATA_DE_API_KEY || ""} 
                      onChange={e => setSettings({...settings, GOVDATA_DE_API_KEY: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Swiss GeoAdmin API Key</label>
                    <input 
                      type="password" 
                      className="institutional-input" 
                      value={settings.SWISS_GEOADMIN_API_KEY || ""} 
                      onChange={e => setSettings({...settings, SWISS_GEOADMIN_API_KEY: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-reg-gold">Denmark Dataforsyningen API Key</label>
                    <div className="flex space-x-2">
                      <input 
                        type="password" 
                        className="institutional-input border-reg-gold/30" 
                        placeholder="Enter Key for api_credentials table"
                        onChange={e => {
                          // We'll handle this separately on save or via a dedicated button
                          (window as any)._denmark_key = e.target.value;
                        }}
                      />
                      <button 
                        onClick={async () => {
                          const key = (window as any)._denmark_key;
                          if (!key) return alert("Please enter a key");
                          const res = await fetch('/api/credentials', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('reg_token')}` 
                            },
                            body: JSON.stringify({ provider: 'denmark_dataforsyningen', key })
                          });
                          if (res.ok) alert("Denmark Credentials Saved Securely");
                        }}
                        className="px-4 py-2 bg-reg-gold text-reg-blue text-[10px] font-bold uppercase rounded hover:bg-opacity-90 transition-colors"
                      >
                        Secure Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="institutional-card p-8">
              <h5 className="text-sm font-bold text-reg-blue uppercase tracking-widest mb-6 flex items-center space-x-2">
                <Bell size={16} className="text-reg-gold" />
                <span>Email & Notifications</span>
              </h5>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SMTP Host</label>
                  <input type="text" className="institutional-input" value={settings.SMTP_HOST || ""} onChange={e => setSettings({...settings, SMTP_HOST: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SMTP User</label>
                    <input type="text" className="institutional-input" value={settings.SMTP_USER || ""} onChange={e => setSettings({...settings, SMTP_USER: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SMTP Password</label>
                    <input type="password" className="institutional-input" value={settings.SMTP_PASS || ""} onChange={e => setSettings({...settings, SMTP_PASS: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
