import React, { useState } from 'react';
import { matchJobDescription } from '../services/geminiService';
import { JobMatchResult } from '../types';
import { Briefcase, Check, X, Loader2, DollarSign } from 'lucide-react';

interface JobMatchViewProps {
  resumeText: string;
}

const JobMatchView: React.FC<JobMatchViewProps> = ({ resumeText }) => {
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!jobDesc.trim()) return;
    setLoading(true);
    try {
      const data = await matchJobDescription(resumeText, jobDesc);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze job match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in pb-20 pt-8">
      <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-white drop-shadow-sm flex items-center">
            <Briefcase className="mr-3 text-blue-200" />
            Job Description Matcher
          </h2>
          <p className="text-blue-100 mt-2 font-medium">Paste a job description to see how well your resume scores against it.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <textarea
            className="w-full p-6 h-80 glass-panel rounded-3xl focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none text-sm placeholder-slate-500 text-slate-800"
            placeholder="Paste Job Description here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
          <button
            onClick={handleMatch}
            disabled={loading || !jobDesc}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Analyze Match'}
          </button>
        </div>

        <div className="glass-panel rounded-3xl p-8 h-full min-h-[20rem] flex flex-col justify-center relative overflow-hidden">
          {!result ? (
            <div className="text-center text-slate-500">
              <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Match results will appear here</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in-up relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl mb-2">
                    <span className="text-5xl font-black text-white">{result.matchPercentage}%</span>
                </div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2">Match Score</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start bg-green-50/80 p-4 rounded-xl border border-green-100">
                    <Check size={20} className="mr-3 text-green-600 mt-0.5" />
                    <div>
                        <span className="font-bold text-xs uppercase text-green-800 block mb-1">Strengths</span>
                        <span className="text-sm text-slate-700 font-medium">{result.strengths.slice(0,3).join(", ")}</span>
                    </div>
                </div>
                 <div className="flex items-start bg-red-50/80 p-4 rounded-xl border border-red-100">
                    <X size={20} className="mr-3 text-red-500 mt-0.5" />
                    <div>
                        <span className="font-bold text-xs uppercase text-red-800 block mb-1">Missing Skills</span>
                        <span className="text-sm text-slate-700 font-medium">{result.missingSkills.join(", ") || "None!"}</span>
                    </div>
                </div>
                 <div className="flex items-center bg-white/60 border border-white/40 p-4 rounded-xl shadow-sm">
                    <DollarSign size={24} className="mr-3 text-green-600 bg-green-100 rounded-lg p-1" />
                    <div>
                        <span className="font-bold text-xs uppercase text-slate-500 block">Est. Salary</span>
                        <span className="text-lg font-bold text-slate-800">{result.salaryEstimation}</span>
                    </div>
                </div>
              </div>

              <div className="text-sm text-slate-600 italic border-t border-slate-200/50 pt-4 bg-white/30 p-4 rounded-xl">
                "{result.recommendation}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchView;