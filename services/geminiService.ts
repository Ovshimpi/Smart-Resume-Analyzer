import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeAnalysis, JobMatchResult, CareerMilestone, InterviewQuestion, SkillNetworkData, StressTestResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON strings if the model adds markdown code blocks
const cleanJson = (text: string) => {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean;
};

export const analyzeResumeContent = async (text: string, file?: { data: string, mimeType: string }): Promise<ResumeAnalysis> => {
  const modelId = 'gemini-2.5-flash';
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      personalInfo: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          email: { type: Type.STRING },
          location: { type: Type.STRING },
        }
      },
      summary: { type: Type.STRING },
      rawText: { type: Type.STRING, description: "The full extracted text content from the resume." },
      atsScore: { type: Type.NUMBER, description: "Score from 0 to 100 based on ATS readability and keyword density" },
      readabilityScore: { type: Type.NUMBER, description: "Score from 0 to 100 based on sentence structure" },
      skills: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            level: { type: Type.STRING },
            category: { type: Type.STRING }
          }
        }
      },
      experiences: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            company: { type: Type.STRING },
            duration: { type: Type.STRING },
            impactScore: { type: Type.NUMBER }
          }
        }
      },
      missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestedRoles: {
        type: Type.ARRAY,
        description: "List of 3-4 job roles the candidate is best suited for based on their current skills.",
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            matchConfidence: { type: Type.STRING, description: "e.g. High, Medium" },
            reason: { type: Type.STRING, description: "Brief reason why they fit this role" }
          }
        }
      }
    }
  };

  const parts: any[] = [];
  if (file) {
    parts.push({
      inlineData: {
        data: file.data,
        mimeType: file.mimeType 
      }
    });
    parts.push({ text: "Analyze the resume provided in this file. Extract all relevant details, suggested job roles, and the full text content according to the schema." });
  } else {
    parts.push({ text: `Analyze the following resume text and fill the schema including suggested job roles:\n\n${text}` });
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: parts
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are an expert Resume Analyzer and Career Coach. Your job is to extract data accurately (including the full raw text of the resume) and provide critical, constructive feedback based on industry standards. Also suggest specific job roles the candidate should apply for."
    }
  });

  const parsedResponse = JSON.parse(cleanJson(response.text || '{}')) as ResumeAnalysis;
  
  // Fallback: If rawText is empty but we had text input, use that.
  if (!parsedResponse.rawText && !file && text) {
    parsedResponse.rawText = text;
  }
  
  return parsedResponse;
};

export const matchJobDescription = async (resumeText: string, jobDescription: string): Promise<JobMatchResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      matchPercentage: { type: Type.NUMBER },
      missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendation: { type: Type.STRING },
      salaryEstimation: { type: Type.STRING }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: `Resume Content: ${resumeText}` },
        { text: `Job Description: ${jobDescription}` },
        { text: "Compare the resume to the job description. Provide a match score, gaps, and salary estimate." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(cleanJson(response.text || '{}')) as JobMatchResult;
};

export const generateCareerPath = async (resumeText: string): Promise<CareerMilestone[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING },
        timeline: { type: Type.STRING },
        requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        description: { type: Type.STRING }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: `Based on this resume, predict a potential 5-year career path with 3-4 milestones: ${resumeText}` }]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(cleanJson(response.text || '{}')) as CareerMilestone[];
};

export const getInterviewQuestions = async (resumeText: string, role?: string): Promise<InterviewQuestion[]> => {
  const targetRole = role || "the candidate's current or next logical role";
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Technical', 'Behavioral', 'Situational'] },
        suggestedAnswerKeyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: `Generate 5 challenging interview questions for ${targetRole} based on this resume: ${resumeText}` }]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(cleanJson(response.text || '{}')) as InterviewQuestion[];
};

export const generateSkillNetwork = async (resumeText: string): Promise<SkillNetworkData> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      nodes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Name of the skill" },
            group: { type: Type.NUMBER, description: "1=Technical, 2=Soft, 3=Tools" },
            radius: { type: Type.NUMBER, description: "Importance 1-10" }
          }
        }
      },
      links: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING, description: "Must match a node id" },
            target: { type: Type.STRING, description: "Must match a node id" },
            value: { type: Type.NUMBER, description: "Strength of relationship 1-5" }
          }
        }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: `Analyze the skills in this resume. Identify clusters of related skills and how they connect. Return a network graph structure with nodes (skills) and links (relationships). Keep it to the top 15-20 most important skills.\n\nResume: ${resumeText}` }]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(cleanJson(response.text || '{}')) as SkillNetworkData;
};

export const runStressTest = async (resumeText: string): Promise<StressTestResult> => {
  const scenarioSchema = {
    type: Type.OBJECT,
    properties: {
      scenarioName: { type: Type.STRING },
      score: { type: Type.NUMBER },
      status: { type: Type.STRING, enum: ['Passed', 'Risk', 'Critical'] },
      feedback: { type: Type.STRING },
      details: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      atsSimulation: scenarioSchema as Schema,
      juniorRecruiter: scenarioSchema as Schema,
      seniorRecruiter: scenarioSchema as Schema,
      glanceTest: scenarioSchema as Schema,
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: `Perform a "Stress Test" on this resume. Simulate 4 specific scenarios:
      1. ATS Parser: How well can a machine read it? (Formatting, Keywords)
      2. Junior Recruiter: Does it have the right buzzwords and basic requirements?
      3. Senior Manager: Does it show impact, metrics, and depth?
      4. 6-Second Glance: What stands out in a quick scan? (Visual hierarchy)
      
      For each, provide a score (0-100), status, feedback, and 3 specific details/observations.
      \n\nResume: ${resumeText}` }]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(cleanJson(response.text || '{}')) as StressTestResult;
};