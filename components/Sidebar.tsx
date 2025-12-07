import React from 'react';
import { LayoutDashboard, FileText, Briefcase, TrendingUp, Users, Settings, LogOut, Share2, Activity, Box } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  hasData: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, hasData }) => {
  const navItems = [
    { id: AppView.UPLOAD, label: 'Upload / Reset', icon: Settings, disabled: false },
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, disabled: !hasData },
    { id: AppView.AR_VIEW, label: 'AR Experience', icon: Box, disabled: !hasData },
    { id: AppView.SKILL_NETWORK, label: 'Skill Network', icon: Share2, disabled: !hasData },
    { id: AppView.STRESS_TEST, label: 'Stress Test', icon: Activity, disabled: !hasData },
    { id: AppView.JOB_MATCH, label: 'Job Matcher', icon: Briefcase, disabled: !hasData },
    { id: AppView.CAREER_PATH, label: 'Career Path', icon: TrendingUp, disabled: !hasData },
    { id: AppView.INTERVIEW_PREP, label: 'Interview Prep', icon: Users, disabled: !hasData },
  ];

  return (
    <div className="w-64 glass-panel-dark text-white flex flex-col h-screen fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
          ResumeAI
        </h1>
        <p className="text-xs text-slate-300 mt-1 font-medium tracking-wide">Smart Career Architect</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mb-2 px-3">
              <button
                onClick={() => !item.disabled && onChangeView(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 border border-transparent
                  ${currentView === item.id 
                    ? 'bg-blue-600/30 border-blue-400/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <item.icon size={20} className={`mr-3 ${currentView === item.id ? 'text-blue-300' : ''}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center text-slate-400 text-sm hover:text-white cursor-pointer transition-colors group">
          <div className="p-2 rounded-lg group-hover:bg-white/10 transition-colors">
            <LogOut size={18} className="mr-2" />
          </div>
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;