import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, Line, Sphere, PerspectiveCamera } from '@react-three/drei';
import { ResumeAnalysis } from '../types';
import * as THREE from 'three';
import { Box as BoxIcon, MousePointer2 } from 'lucide-react';

interface ARViewProps {
  resumeData: ResumeAnalysis;
}

interface ExperienceNodeProps {
  position: [number, number, number];
  role: string;
  company: string;
  year: string;
  index: number;
}

// 3D Experience Node
const ExperienceNode: React.FC<ExperienceNodeProps> = ({ position, role, company, year, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
        // Gentle rotation
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Card Background */}
        <mesh 
            ref={meshRef}
            onPointerOver={() => setHovered(true)} 
            onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[3.5, 2, 0.2]} />
          <meshStandardMaterial 
            color={hovered ? "#3b82f6" : "#1e293b"} 
            opacity={0.9} 
            transparent 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        
        {/* Borders */}
        <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3.5, 2, 0.2)]} />
            <lineBasicMaterial color={hovered ? "#60a5fa" : "#475569"} />
        </lineSegments>

        {/* Text Content */}
        <Text
          position={[0, 0.4, 0.15]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
          {role}
        </Text>
        <Text
          position={[0, -0.1, 0.15]}
          fontSize={0.18}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
        >
          {company}
        </Text>
        <Text
          position={[0, -0.6, 0.15]}
          fontSize={0.15}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {year}
        </Text>
      </Float>
      
      {/* Connecting Line to central axis */}
      <Line
         points={[[0, 0, 0], [position[0] > 0 ? -2 : 2, 0, -2]]} // Simplified connection visual
         color={hovered ? "#60a5fa" : "#334155"}
         lineWidth={1}
         transparent
         opacity={0.5}
      />
    </group>
  );
};

interface SkillOrbProps {
  position: [number, number, number];
  skill: string;
  color: string;
}

// 3D Skill Orb
const SkillOrb: React.FC<SkillOrbProps> = ({ position, skill, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <mesh 
            ref={meshRef}
            onPointerOver={() => setHovered(true)} 
            onPointerOut={() => setHovered(false)}
            scale={hovered ? 1.2 : 1}
        >
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.2}
            wireframe={!hovered}
            transparent
            opacity={0.8}
          />
        </mesh>
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="bottom"
          visible={true}
        >
          {skill}
        </Text>
      </Float>
    </group>
  );
};

const TimelineScene = ({ data }: { data: ResumeAnalysis }) => {
  const experiences = data.experiences || [];
  const skills = data.skills || [];

  // Generate positions for skills in a spiral around the user
  const skillNodes = useMemo(() => {
    return skills.slice(0, 15).map((skill, i) => {
      const angle = (i / 15) * Math.PI * 2;
      const radius = 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 6; // Random height spread
      
      let color = "#3b82f6"; // Default Blue
      if (skill.category === 'Soft') color = "#10b981"; // Green
      if (skill.category === 'Tool') color = "#f59e0b"; // Orange

      return <SkillOrb key={i} position={[x, y, z]} skill={skill.name} color={color} />;
    });
  }, [skills]);

  return (
    <>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#blue" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Central Timeline Axis */}
        <Line 
            points={[[0, -10, 0], [0, 10, 0]]}
            color="#3b82f6"
            lineWidth={2}
            transparent
            opacity={0.2}
        />

        {/* Experience Cards (Staggered) */}
        {experiences.map((exp, i) => (
            <ExperienceNode 
                key={i}
                index={i}
                position={[
                    i % 2 === 0 ? 2.5 : -2.5, // Alternating sides
                    4 - (i * 3), // Stacking downwards
                    0
                ]}
                role={exp.role}
                company={exp.company}
                year={exp.duration}
            />
        ))}

        {/* Floating Skills */}
        {skillNodes}
    </>
  );
};

const ARView: React.FC<ARViewProps> = ({ resumeData }) => {
  return (
    <div className="h-screen w-full relative animate-fade-in" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 glass-panel p-4 rounded-xl max-w-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <BoxIcon className="mr-2 text-blue-600"/> 3D Career Universe
        </h2>
        <p className="text-sm text-slate-600 mt-1">
            Explore your professional journey in spatial reality. Drag to rotate, scroll to zoom.
        </p>
        <div className="flex items-center mt-3 text-xs text-slate-500">
             <MousePointer2 size={12} className="mr-1"/> Interactive Mode
        </div>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
        <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxDistance={20}
            minDistance={5}
        />
        <TimelineScene data={resumeData} />
      </Canvas>
    </div>
  );
};

export default ARView;