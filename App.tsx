import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import UploadView from './views/UploadView';
import DashboardView from './views/DashboardView';
import JobMatchView from './views/JobMatchView';
import CareerPathView from './views/CareerPathView';
import InterviewPrepView from './views/InterviewPrepView';
import SkillNetworkView from './views/SkillNetworkView';
import StressTestView from './views/StressTestView';
import ARView from './views/ARView';
import { AppView, ResumeAnalysis } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [resumeData, setResumeData] = useState<ResumeAnalysis | null>(null);
  const [resumeRawText, setResumeRawText] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAnalysisComplete = (data: ResumeAnalysis, rawText: string) => {
    setResumeData(data);
    setResumeRawText(rawText);
    setCurrentView(AppView.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.UPLOAD:
        return <UploadView onAnalysisComplete={handleAnalysisComplete} />;
      case AppView.DASHBOARD:
        return resumeData ? <DashboardView data={resumeData} /> : null;
      case AppView.JOB_MATCH:
        return <JobMatchView resumeText={resumeRawText} />;
      case AppView.CAREER_PATH:
        return <CareerPathView resumeText={resumeRawText} />;
      case AppView.INTERVIEW_PREP:
        return <InterviewPrepView resumeText={resumeRawText} />;
      case AppView.SKILL_NETWORK:
        return <SkillNetworkView resumeText={resumeRawText} />;
      case AppView.STRESS_TEST:
        return <StressTestView resumeText={resumeRawText} />;
      case AppView.AR_VIEW:
        return resumeData ? <ARView resumeData={resumeData} /> : null;
      default:
        return <UploadView onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans text-slate-800 relative">
      {/* Background Layer */}
      <div className="live-gradient-bg" />

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full top-0 z-20 glass-panel-dark text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">ResumeAI</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="text-white" />
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <div className={`
        fixed md:relative z-30 transition-transform duration-300 md:translate-x-0 h-full
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
         <Sidebar 
          currentView={currentView} 
          onChangeView={(view) => {
            setCurrentView(view);
            setIsMobileMenuOpen(false);
          }}
          hasData={!!resumeData} 
        />
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-0 overflow-y-auto h-screen relative z-10 flex flex-col">
        <div className="container mx-auto flex-1">
          {renderContent()}
        </div>
        <footer className="w-full py-6 text-center text-blue-100/50 text-sm font-medium tracking-wide">
            © 2025-26 All Rights Reserved. Developed by Om Shimpi
        </footer>
      </main>
    </div>
  );
};

export default App;