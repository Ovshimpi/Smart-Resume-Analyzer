import React, { useEffect, useState } from 'react';
import { runStressTest } from '../services/geminiService';
import { StressTestResult, StressTestScenario } from '../types';
import { Activity, Loader2, CheckCircle, AlertTriangle, XCircle, Eye, User, UserCheck, Cpu } from 'lucide-react';

interface StressTestViewProps {
  resumeText: string;
}

const StressTestView: React.FC<StressTestViewProps> = ({ resumeText }) => {
  const [results, setResults] = useState<StressTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await runStressTest(resumeText);
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [resumeText]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <div className="relative">
             <Activity className="text-white animate-bounce mb-4" size={48} />
             <div className="absolute -inset-4 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>
        </div>
        <p className="text-white text-lg font-medium">Running simulation scenarios...</p>
        <p className="text-blue-200 text-sm mt-2">Testing against ATS • Junior Recruiter • Senior Manager • Glance Test</p>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    if (status === 'Passed') return <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><CheckCircle size={14} className="mr-1"/> Passed</span>;
    if (status === 'Risk') return <span className="flex items-center text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><AlertTriangle size={14} className="mr-1"/> Risk</span>;
    return <span className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><XCircle size={14} className="mr-1"/> Critical</span>;
  };

  const ScenarioCard = ({ data, icon: Icon, title, description }: { data: StressTestScenario, icon: any, title: string, description: string }) => (
    <div className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:bg-white/80 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg mr-4">
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
            {renderStatusBadge(data.status)}
        </div>

        {/* Score Bar */}
        <div className="mb-4">
            <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
                <span>Success Probability</span>
                <span>{data.score}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                    className={`h-2.5 rounded-full ${data.score > 75 ? 'bg-green-500' : data.score > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    style={{ width: `${data.score}%` }}
                ></div>
            </div>
        </div>

        <p className="text-sm text-slate-600 italic mb-4 border-l-2 border-blue-300 pl-3">"{data.feedback}"</p>

        <div className="mt-auto bg-white/50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Key Observations</h4>
            <ul className="space-y-1">
                {data.details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start">
                        <span className="mr-2 text-blue-500">•</span> {detail}
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in pt-8 pb-20">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-white drop-shadow-sm flex items-center">
            <Activity className="mr-3 text-blue-200" />
            Resume Stress Simulator
        </h2>
        <p className="text-blue-100 mt-2 font-medium">
            We simulate how your resume performs in 4 critical screening environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results && (
            <>
                <ScenarioCard 
                    title="ATS Parser Bot" 
                    description="Automated Keyword & Format Check"
                    icon={Cpu} 
                    data={results.atsSimulation} 
                />
                <ScenarioCard 
                    title="Junior Recruiter" 
                    description="15-Second Screen for Requirements"
                    icon={User} 
                    data={results.juniorRecruiter} 
                />
                <ScenarioCard 
                    title="Senior Hiring Manager" 
                    description="Deep Dive into Impact & Culture"
                    icon={UserCheck} 
                    data={results.seniorRecruiter} 
                />
                 <ScenarioCard 
                    title="The 6-Second Glance" 
                    description="Visual Hierarchy & First Impressions"
                    icon={Eye} 
                    data={results.glanceTest} 
                />
            </>
        )}
      </div>
    </div>
  );
};

export default StressTestView;