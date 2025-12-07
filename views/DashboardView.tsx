import React from 'react';
import { ResumeAnalysis } from '../types';
import { RadialBarChart, RadialBar, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { CheckCircle, AlertTriangle, MapPin, Mail, Briefcase, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DashboardViewProps {
  data: ResumeAnalysis;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data }) => {
  const scoreData = [
    { name: 'ATS Score', value: data.atsScore, fill: '#3b82f6' },
  ];

  const skillData = data.skills.map(skill => ({
    subject: skill.name,
    A: skill.level === 'Expert' ? 100 : skill.level === 'Intermediate' ? 65 : 30,
    fullMark: 100,
  })).slice(0, 6); // Take top 6 for clean chart

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // -- Header --
    doc.setFillColor(59, 130, 246); // Blue header
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Resume Analysis Report", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 255);
    doc.text(`Generated for ${data.personalInfo.name || 'Candidate'}`, 20, 30);
    doc.text(new Date().toLocaleDateString(), pageWidth - 40, 30);

    // -- Content Start Y Position --
    let yPos = 55;

    // -- Scores --
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Performance Scores", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`ATS Compatibility: ${data.atsScore}/100`, 20, yPos);
    doc.text(`Readability Score: ${data.readabilityScore}/100`, 100, yPos);
    yPos += 15;
    
    // -- Summary --
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Professional Summary", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(data.summary, 170);
    doc.text(summaryLines, 20, yPos);
    yPos += (summaryLines.length * 5) + 10;

    // -- Skills --
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Top Detected Skills", 20, yPos);
    yPos += 8;
    
    const skillsText = data.skills.map(s => s.name).join(", ");
    const skillLines = doc.splitTextToSize(skillsText, 170);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(skillLines, 20, yPos);
    yPos += (skillLines.length * 5) + 10;

    // -- Suggested Roles --
    if (data.suggestedRoles && data.suggestedRoles.length > 0) {
        // Check page break
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text("Recommended Roles", 20, yPos);
        yPos += 8;

        data.suggestedRoles.forEach(role => {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`• ${role.role} (${role.matchConfidence} Match)`, 20, yPos);
            yPos += 5;
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            const reasonLines = doc.splitTextToSize(role.reason, 160);
            doc.text(reasonLines, 25, yPos);
            yPos += (reasonLines.length * 4) + 6;
        });
        yPos += 5;
    }

    // -- Critical Improvements --
    if (data.improvements.length > 0) {
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(14);
        doc.setTextColor(180, 83, 9); // Amber/Orange color
        doc.text("Critical Improvements", 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        data.improvements.forEach(imp => {
             const lines = doc.splitTextToSize(`• ${imp}`, 170);
             doc.text(lines, 20, yPos);
             yPos += (lines.length * 5) + 2;
        });
    }

    // -- Footer --
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Developed by Om Shimpi", pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    doc.save(`${(data.personalInfo.name || 'Resume').replace(/\s+/g, '_')}_Analysis.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in pt-8">
      
      {/* Header Profile */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{data.personalInfo.name || 'Candidate'}</h1>
            <div className="flex items-center space-x-6 mt-3 text-slate-600 font-medium">
                <span className="flex items-center bg-white/50 px-3 py-1 rounded-lg"><Mail size={16} className="mr-2 text-blue-600"/> {data.personalInfo.email || 'No Email'}</span>
                <span className="flex items-center bg-white/50 px-3 py-1 rounded-lg"><MapPin size={16} className="mr-2 text-red-500"/> {data.personalInfo.location || 'Unknown Location'}</span>
            </div>
        </div>
        <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
            <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30">
                Resume Health: {data.atsScore > 75 ? 'Excellent' : data.atsScore > 50 ? 'Good' : 'Needs Work'}
            </div>
            <button 
                onClick={handleDownloadPDF}
                className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
            >
                <Download size={16} className="mr-2" />
                Download Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center transform transition-hover hover:scale-[1.02] duration-300">
          <h3 className="text-xl font-bold text-slate-700 mb-2">ATS Compatibility</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={20} data={scoreData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={30} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-black fill-slate-800">
                  {data.atsScore}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-slate-500 font-medium mt-2 bg-white/50 px-3 py-1 rounded-full">
            Keyword density & Structure
          </p>
        </div>

        {/* Skills Radar */}
        <div className="glass-panel p-6 rounded-3xl col-span-1 md:col-span-2">
          <h3 className="text-xl font-bold text-slate-700 mb-2 ml-4">Skill Profile</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Skill Level" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Suggested Roles */}
      {data.suggestedRoles && data.suggestedRoles.length > 0 && (
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-indigo-100/80 rounded-lg text-indigo-600 mr-3">
              <Briefcase size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Jobs You Should Apply For</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.suggestedRoles.map((role, idx) => (
              <div key={idx} className="bg-white/40 p-5 rounded-xl border border-white/50 hover:bg-white/60 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-slate-800">{role.role}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${role.matchConfidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {role.matchConfidence} Match
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{role.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-amber-100/80 rounded-lg text-amber-600 mr-3">
                   <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Critical Improvements</h3>
            </div>
            <ul className="space-y-3">
                {data.improvements.slice(0, 4).map((imp, idx) => (
                    <li key={idx} className="flex items-start text-sm text-slate-700 bg-amber-50/80 p-3 rounded-xl border border-amber-100">
                        <span className="mr-2 mt-0.5 text-amber-500 font-bold">•</span> {imp}
                    </li>
                ))}
            </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100/80 rounded-lg text-green-600 mr-3">
                    <CheckCircle size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Professional Summary</h3>
            </div>
            <div className="bg-white/40 p-5 rounded-xl text-sm text-slate-700 italic border-l-4 border-blue-500 leading-relaxed shadow-inner">
                "{data.summary}"
            </div>
            <div className="mt-6">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detected Keywords</h4>
                 <div className="flex flex-wrap gap-2">
                    {data.skills.slice(0, 8).map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-white/60 text-slate-700 text-xs font-semibold rounded-lg border border-white/40 shadow-sm">
                            {s.name}
                        </span>
                    ))}
                 </div>
            </div>
        </div>
      </div>
      
    </div>
  );
};

export default DashboardView;