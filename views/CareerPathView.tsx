import React, { useEffect, useState } from 'react';
import { generateCareerPath } from '../services/geminiService';
import { CareerMilestone } from '../types';
import { TrendingUp, Loader2, Target, ArrowRight } from 'lucide-react';

interface CareerPathViewProps {
  resumeText: string;
}

const CareerPathView: React.FC<CareerPathViewProps> = ({ resumeText }) => {
  const [milestones, setMilestones] = useState<CareerMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const data = await generateCareerPath(resumeText);
        setMilestones(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [resumeText]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
        <p className="text-white font-medium mt-6 animate-pulse">Designing your future career...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in pb-20 pt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center drop-shadow-sm">
            <TrendingUp className="mr-3 text-blue-200" />
            Projected Career Path
        </h2>
        <p className="text-blue-100 mt-2 font-medium">AI-generated milestones for the next 5 years based on your current skills.</p>
      </div>

      <div className="relative border-l-4 border-white/20 ml-6 space-y-12">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative pl-8 group">
            <div className="absolute -left-[1.3rem] top-0 bg-slate-900 border-4 border-blue-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-slate-800">{milestone.role}</h3>
                    <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase rounded-full mt-2 md:mt-0 w-fit shadow-md">
                        {milestone.timeline}
                    </span>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed text-lg">{milestone.description}</p>
                
                <div className="bg-white/50 p-5 rounded-2xl border border-white/60">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                        <Target size={16} className="mr-2 text-red-500"/> Skills to Acquire
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {milestone.requiredSkills.map((skill, idx) => (
                            <span key={idx} className="flex items-center px-3 py-1 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            {index < milestones.length - 1 && (
                <div className="hidden md:block absolute left-12 -bottom-8 text-white/30 animate-bounce">
                    <ArrowRight className="transform rotate-90" size={24} />
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerPathView;