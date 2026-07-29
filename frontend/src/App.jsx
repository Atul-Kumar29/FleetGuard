import React, { useState } from 'react';
import PredictiveMaintenance from './pages/PredictiveMaintenance';
import FleetAnalytics from './pages/FleetAnalytics';
import { Shield, LayoutDashboard, Truck, Settings, BarChart3, Wrench } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics'); // Default to Analytics dashboard

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-lg shadow-md shadow-sky-500/10">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">Fleet<span className="text-sky-400">Guard</span></span>
              <span className="ml-1.5 px-2 py-0.5 bg-slate-800 text-[10px] font-bold text-slate-400 rounded uppercase tracking-wider border border-slate-700/50">
                SaaS Admin
              </span>
            </div>
          </div>
          
          {/* Interactive Navigation */}
          <nav className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`text-xs sm:text-sm font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg ${
                activeTab === 'analytics' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Fleet Analytics
            </button>
            <button
              onClick={() => setActiveTab('predictive')}
              className={`text-xs sm:text-sm font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg ${
                activeTab === 'predictive' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Wrench className="w-4 h-4" /> Predictive Risk
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' ? <FleetAnalytics /> : <PredictiveMaintenance />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} FleetGuard Fleet Management SaaS. All rights reserved.
      </footer>
    </div>
  );
}
