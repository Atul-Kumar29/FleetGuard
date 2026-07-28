import React from 'react';
import PredictiveMaintenance from './pages/PredictiveMaintenance';
import { Shield, LayoutDashboard, Truck, Settings } from 'lucide-react';

export default function App() {
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
          
          {/* Navigation Items (Visual Placeholders for design completeness) */}
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </span>
            <span className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> Fleet List
            </span>
            <span className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer inline-flex items-center gap-1.5 border-b-2 border-sky-500 py-5">
              Predictive Maintenance
            </span>
            <span className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> Settings
            </span>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PredictiveMaintenance />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} FleetGuard Fleet Management SaaS. All rights reserved.
      </footer>
    </div>
  );
}
