import React, { useEffect, useState, useRef } from 'react';
import { generateSkillNetwork } from '../services/geminiService';
import { SkillNetworkData, SkillNode, SkillLink } from '../types';
import { Share2, Loader2, Info } from 'lucide-react';

interface SkillNetworkViewProps {
  resumeText: string;
}

const SkillNetworkView: React.FC<SkillNetworkViewProps> = ({ resumeText }) => {
  const [data, setData] = useState<SkillNetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // Simulation State
  const [nodes, setNodes] = useState<(SkillNode & { x: number; y: number; vx: number; vy: number })[]>([]);
  const [links, setLinks] = useState<SkillLink[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const network = await generateSkillNetwork(resumeText);
        setData(network);
        
        // Initialize positions randomly within center
        const initialNodes = network.nodes.map(n => ({
          ...n,
          x: 400 + (Math.random() - 0.5) * 200,
          y: 300 + (Math.random() - 0.5) * 200,
          vx: 0,
          vy: 0
        }));
        setNodes(initialNodes);
        setLinks(network.links);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resumeText]);

  // Physics Simulation Loop
  useEffect(() => {
    if (!data || nodes.length === 0) return;

    let animationFrameId: number;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => ({ ...n }));
        const width = 800;
        const height = 600;

        // Forces
        const repulsion = 400;
        const springLength = 100;
        const springStrength = 0.05;
        const centerForce = 0.02;

        // 1. Repulsion (Node vs Node)
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[i].x - newNodes[j].x;
            const dy = newNodes[i].y - newNodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            newNodes[i].vx += fx;
            newNodes[i].vy += fy;
            newNodes[j].vx -= fx;
            newNodes[j].vy -= fy;
          }
        }

        // 2. Attraction (Links)
        links.forEach(link => {
          const source = newNodes.find(n => n.id === link.source);
          const target = newNodes.find(n => n.id === link.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - springLength) * springStrength;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // 3. Center Gravity & Velocity Damping
        newNodes.forEach(node => {
          node.vx += (width / 2 - node.x) * centerForce;
          node.vy += (height / 2 - node.y) * centerForce;
          
          node.vx *= 0.9; // Friction
          node.vy *= 0.9;

          node.x += node.vx;
          node.y += node.vy;
        });

        return newNodes;
      });

      animationFrameId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [data, links]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <Loader2 className="animate-spin text-white mb-4" size={48} />
        <p className="text-white text-lg">Mapping your skill universe...</p>
      </div>
    );
  }

  const getNodeColor = (group: number) => {
    switch (group) {
      case 1: return '#3b82f6'; // Technical - Blue
      case 2: return '#10b981'; // Soft - Emerald
      default: return '#f59e0b'; // Tools - Amber
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in pt-8 pb-20">
      <div className="mb-4">
        <h2 className="text-3xl font-extrabold text-white drop-shadow-sm flex items-center">
          <Share2 className="mr-3 text-blue-200" />
          Skill Network Visualization
        </h2>
        <p className="text-blue-100 mt-2 font-medium">Interactive graph showing how your skills cluster and connect. Stronger links indicate skills often used together.</p>
      </div>

      <div className="glass-panel p-4 rounded-3xl relative overflow-hidden h-[600px] flex items-center justify-center">
        {/* Legend */}
        <div className="absolute top-6 left-6 flex flex-col space-y-2 bg-white/80 p-3 rounded-xl backdrop-blur-sm shadow-sm z-10">
            <div className="flex items-center text-xs font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Technical Skills
            </div>
            <div className="flex items-center text-xs font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Soft Skills
            </div>
            <div className="flex items-center text-xs font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span> Tools & Tech
            </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 800 600" className="w-full h-full cursor-grab active:cursor-grabbing">
            {/* Links */}
            {links.map((link, i) => {
                const source = nodes.find(n => n.id === link.source);
                const target = nodes.find(n => n.id === link.target);
                if (!source || !target) return null;
                return (
                    <line 
                        key={i}
                        x1={source.x} y1={source.y}
                        x2={target.x} y2={target.y}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth={link.value}
                    />
                );
            })}

            {/* Nodes */}
            {nodes.map((node, i) => (
                <g key={i} transform={`translate(${node.x},${node.y})`}>
                    <circle 
                        r={node.radius * 2.5 + 10} 
                        fill={getNodeColor(node.group)}
                        fillOpacity="0.2"
                        className="animate-pulse"
                    />
                    <circle 
                        r={node.radius * 1.5 + 5} 
                        fill={getNodeColor(node.group)}
                        stroke="#fff"
                        strokeWidth="2"
                        className="hover:scale-110 transition-transform duration-200"
                        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }}
                    />
                    <text 
                        dy={node.radius * 1.5 + 20} 
                        textAnchor="middle" 
                        className="text-xs font-bold fill-slate-800 bg-white/50 pointer-events-none"
                        style={{ textShadow: '0px 0px 4px white' }}
                    >
                        {node.id}
                    </text>
                </g>
            ))}
        </svg>

        <div className="absolute bottom-6 right-6 flex items-center bg-blue-100/90 text-blue-800 px-4 py-2 rounded-xl text-xs font-bold">
            <Info size={14} className="mr-2"/> 
            Node size = Skill Proficiency
        </div>
      </div>
    </div>
  );
};

export default SkillNetworkView;