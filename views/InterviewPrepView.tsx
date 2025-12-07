import React, { useState } from 'react';
import { getInterviewQuestions } from '../services/geminiService';
import { InterviewQuestion } from '../types';
import { Users, ChevronDown, ChevronUp, Loader2, MessageSquare, BrainCircuit } from 'lucide-react';

interface InterviewPrepViewProps {
  resumeText: string;
}

const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({ resumeText }) => {
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setQuestions([]);
    try {
      const data = await getInterviewQuestions(resumeText, role);
      setQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in pb-20 pt-8">
      <div className="text-center md:text-left mb-8">
          <h2 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start drop-shadow-sm">
            <Users className="mr-3 text-blue-200" />
            Smart Interview Coach
          </h2>
          <p className="text-blue-100 mt-2 font-medium">Generate tailored interview questions based on your resume and target role.</p>
      </div>

      <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-lg">
        <input 
            type="text" 
            placeholder="Enter Target Job Title (e.g. Senior Product Manager)" 
            className="flex-1 p-4 bg-white/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 placeholder-slate-500 font-medium"
            value={role}
            onChange={(e) => setRole(e.target.value)}
        />
        <button 
            onClick={handleGenerate}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-md"
        >
            {loading ? <Loader2 className="animate-spin mr-2"/> : 'Generate Questions'}
        </button>
      </div>

      <div className="space-y-4 mt-8">
        {questions.length === 0 && !loading && (
             <div className="glass-panel p-12 rounded-3xl text-center text-slate-200">
                <BrainCircuit size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">Ready to practice? Enter a job title above.</p>
             </div>
        )}

        {questions.map((q, idx) => (
            <div key={idx} className="glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/80">
                <button 
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left"
                >
                    <div className="flex items-start pr-4">
                        <span className={`
                            text-xs font-bold px-3 py-1 rounded-full mr-4 mt-0.5 min-w-fit shadow-sm text-white
                            ${q.type === 'Technical' ? 'bg-purple-500' : q.type === 'Behavioral' ? 'bg-orange-500' : 'bg-blue-500'}
                        `}>
                            {q.type}
                        </span>
                        <span className="font-semibold text-slate-800 text-lg leading-snug">{q.question}</span>
                    </div>
                    {openIndex === idx ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                </button>
                
                {openIndex === idx && (
                    <div className="p-6 bg-white/40 border-t border-white/50 backdrop-blur-md">
                        <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center uppercase tracking-wider">
                            <MessageSquare size={16} className="mr-2 text-blue-600"/> Expert Answer Tips
                        </h4>
                        <ul className="space-y-2">
                            {q.suggestedAnswerKeyPoints.map((point, i) => (
                                <li key={i} className="flex items-start text-slate-700 text-base">
                                    <span className="mr-2 text-blue-500 font-bold">•</span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewPrepView;