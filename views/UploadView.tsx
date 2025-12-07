import React, { useState, ChangeEvent } from 'react';
import { UploadCloud, FileText, File as FileIcon, Loader2 } from 'lucide-react';
import { analyzeResumeContent } from '../services/geminiService';
import { ResumeAnalysis } from '../types';

interface UploadViewProps {
  onAnalysisComplete: (data: ResumeAnalysis, rawText: string) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onAnalysisComplete }) => {
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextAnalyze = async () => {
    if (!textInput.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeResumeContent(textInput);
      onAnalysisComplete(data, textInput);
    } catch (err) {
      setError("Failed to analyze resume. Please try again or check your API key.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Support for PDF and Images via Multimodal
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result as string;
          // Extract base64 part
          const base64String = result.split(',')[1];
          
          try {
            const data = await analyzeResumeContent("File Upload", { data: base64String, mimeType: file.type });
            // Use the extracted rawText from the AI response, or fallback to a placeholder if it failed to extract
            onAnalysisComplete(data, data.rawText || `Analyzed content from ${file.name}`);
          } catch (err) {
            console.error(err);
             setError("Failed to analyze the file. Please ensure it is a valid PDF or Image.");
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain') {
          const text = await file.text();
          setTextInput(text);
          const data = await analyzeResumeContent(text);
          onAnalysisComplete(data, text);
          setIsLoading(false);
      } else {
        setError("Unsupported file format. Please upload PDF, PNG, JPG, or TXT.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error processing file.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in pt-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl font-black text-white drop-shadow-md">Smart Resume Analyzer</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
          Unlock your career potential with next-gen AI. <br/>
          <span className="font-medium text-white">Instant feedback, job matching, and interview prep.</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-10">
        {/* Paste Text Section */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col h-full transform transition-all hover:scale-[1.01] duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-700 backdrop-blur-sm">
              <FileText size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Paste Resume Text</h2>
          </div>
          <textarea
            className="flex-1 w-full p-4 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all text-sm placeholder-slate-500 text-slate-800 shadow-inner"
            placeholder="Copy and paste your resume content here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
          />
          <button
            onClick={handleTextAnalyze}
            disabled={isLoading || !textInput.trim()}
            className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Analyze Text'}
          </button>
        </div>

        {/* Upload File Section */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col transform transition-all hover:scale-[1.01] duration-300">
           <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-purple-600/20 rounded-2xl text-purple-700 backdrop-blur-sm">
              <UploadCloud size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Upload Resume</h2>
          </div>
          
          <div className="flex-1 border-2 border-dashed border-slate-400/50 rounded-2xl flex flex-col items-center justify-center p-8 bg-white/30 hover:bg-white/50 transition-all cursor-pointer relative group">
            <input 
                type="file" 
                accept=".pdf, .txt, .png, .jpg, .jpeg"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isLoading}
            />
            <div className="bg-white/80 p-5 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
              {isLoading ? (
                <Loader2 size={40} className="text-purple-600 animate-spin" />
              ) : (
                <FileIcon size={40} className="text-purple-600" />
              )}
            </div>
            <p className="text-lg font-semibold text-slate-700">Drop your resume here</p>
            <p className="text-sm text-slate-500 mt-2">PDF, PNG, JPG or TXT (Max 10MB)</p>
          </div>

           <div className="mt-6 p-4 bg-purple-100/50 border border-purple-200/50 rounded-xl">
             <p className="text-sm text-purple-900 flex items-start">
               <span className="font-bold mr-1">Pro Tip:</span> 
               We support PDF files directly! The AI extracts text and layout automatically.
             </p>
           </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100/90 text-red-700 rounded-xl border border-red-200 text-center animate-bounce shadow-lg backdrop-blur-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadView;