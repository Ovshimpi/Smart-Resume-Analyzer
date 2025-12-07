export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  JOB_MATCH = 'JOB_MATCH',
  CAREER_PATH = 'CAREER_PATH',
  INTERVIEW_PREP = 'INTERVIEW_PREP',
  SKILL_NETWORK = 'SKILL_NETWORK',
  STRESS_TEST = 'STRESS_TEST',
  AR_VIEW = 'AR_VIEW',
}

export interface Skill {
  name: string;
  level: string; // Beginner, Intermediate, Expert
  category: string; // Technical, Soft, Tool
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  impactScore: number; // 1-10 calculated by AI
}

export interface SuggestedJob {
  role: string;
  matchConfidence: string; // High, Medium, Low
  reason: string;
}

export interface ResumeAnalysis {
  personalInfo: {
    name: string;
    email: string;
    location: string;
  };
  summary: string;
  rawText: string; // Extracted text from the resume file
  atsScore: number;
  readabilityScore: number;
  skills: Skill[];
  experiences: Experience[];
  missingKeywords: string[];
  improvements: string[];
  suggestedRoles: SuggestedJob[];
}

export interface JobMatchResult {
  matchPercentage: number;
  missingSkills: string[];
  strengths: string[];
  recommendation: string;
  salaryEstimation: string;
}

export interface CareerMilestone {
  role: string;
  timeline: string;
  requiredSkills: string[];
  description: string;
}

export interface InterviewQuestion {
  question: string;
  type: 'Technical' | 'Behavioral' | 'Situational';
  suggestedAnswerKeyPoints: string[];
}

// New Types for Skill Network
export interface SkillNode {
  id: string;
  group: number; // For coloring
  radius: number; // Based on importance
}

export interface SkillLink {
  source: string;
  target: string;
  value: number; // Strength of connection
}

export interface SkillNetworkData {
  nodes: SkillNode[];
  links: SkillLink[];
}

// New Types for Stress Test
export interface StressTestScenario {
  scenarioName: string; // e.g., "ATS Parser", "Junior Recruiter"
  score: number; // 0-100
  status: 'Passed' | 'Risk' | 'Critical';
  feedback: string;
  details: string[]; // Specific points
}

export interface StressTestResult {
  atsSimulation: StressTestScenario;
  juniorRecruiter: StressTestScenario; // Keyword focus
  seniorRecruiter: StressTestScenario; // Impact focus
  glanceTest: StressTestScenario; // 6-second test
}