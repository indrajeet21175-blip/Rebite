import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please check the Settings > Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // 1. AI Food Demand Prediction & Surplus Forecasting
  app.post('/api/ai/predict-demand', async (req: Request, res: Response) => {
    try {
      const ai = getGenAIClient();
      const { mealType, date, dayOfWeek, isWeekend, totalRegisteredStudents, confirmedCount, menuItems, historicalAttendance } = req.body;

      const prompt = `You are an expert Campus Mess Food Demand Forecasting AI for an Indian university dining facility.
Analyze the following actual campus meal data and predict expected attendance, recommended preparation quantities (in kg), and potential surplus risk before cooking begins.

Important Constraint: Base all figures strictly on the provided confirmed student attendance, historical weekday/weekend attendance patterns, and menu items. Clearly state assumptions and do not fabricate historical accuracy scores.

Input Data:
- Date: ${date} (${dayOfWeek}, ${isWeekend ? 'Weekend' : 'Weekday'})
- Meal Session: ${mealType}
- Total Registered Hostel Students: ${totalRegisteredStudents}
- Confirmed Student Attendance So Far: ${confirmedCount}
- Planned Menu Items: ${JSON.stringify(menuItems)}
- Historical Attendance Records (last 7 sessions): ${JSON.stringify(historicalAttendance)}

Return a structured JSON forecast.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictedHeadcount: {
                type: Type.INTEGER,
                description: 'Predicted number of students who will actually attend the meal based on confirmations and walk-in pattern.',
              },
              recommendedTotalKg: {
                type: Type.NUMBER,
                description: 'Recommended total food weight to prepare in kilograms (approx 0.42 kg per predicted student).',
              },
              expectedSurplusKgIfUnadjusted: {
                type: Type.NUMBER,
                description: 'Estimated surplus in kg if the mess prepares for standard baseline instead of adjusted demand.',
              },
              confidenceNote: {
                type: Type.STRING,
                description: 'Transparent explanation of how the estimate was derived from confirmed attendance and historical weekday/weekend trends.',
              },
              itemRecommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemName: { type: Type.STRING },
                    plannedKg: { type: Type.NUMBER },
                    recommendedKg: { type: Type.NUMBER },
                    adjustmentReason: { type: Type.STRING },
                  },
                },
              },
              actionableAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: any) {
      console.error('Gemini Demand Prediction Error:', error);
      res.status(error?.status || 500).json({
        error: error?.message || 'Failed to run Gemini demand prediction.',
      });
    }
  });

  // 2. AI-Assisted Visual Food Quality Observations (NGO / Inspector Workflow)
  app.post('/api/ai/inspect-food', async (req: Request, res: Response) => {
    try {
      const ai = getGenAIClient();
      const {
        foodName,
        prepTime,
        storageTemp,
        storageDurationHours,
        packagingCondition,
        transportCondition,
        imageBase64,
        imageUrl,
      } = req.body;

      const parts: any[] = [];

      // Attach image if base64 provided or if local generated asset path exists
      if (imageBase64 && typeof imageBase64 === 'string') {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const mimeMatch = imageBase64.match(/data:(.*?);base64/);
        parts.push({
          inlineData: {
            mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
            data: cleanBase64,
          },
        });
      } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/src/assets/')) {
        const localFilePath = path.join(__dirname, imageUrl);
        if (fs.existsSync(localFilePath)) {
          const fileBuffer = fs.readFileSync(localFilePath);
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: fileBuffer.toString('base64'),
            },
          });
        }
      }

      const textPrompt = `You are an AI-Assisted Food Quality Observation tool helping a certified NGO Food Safety Inspector evaluate surplus campus food prior to physical human inspection.

CRITICAL SAFETY RULE:
You must NEVER certify food as safe to eat based on a photograph or metadata. You must NEVER automatically approve food for distribution. Your role is strictly to surface preliminary visual observations, potential thermal/holding time risks, missing safety data, and mandatory physical inspection steps for the human inspector.

Food Batch Details Submitted:
- Food Name: ${foodName}
- Preparation Time: ${prepTime}
- Current Storage Temperature: ${storageTemp}
- Time Elapsed Since Preparation: ${storageDurationHours} hours
- Packaging Condition: ${packagingCondition}
- Planned Transportation Condition: ${transportCondition}

Analyze both the visual appearance in the image (if attached) and the holding parameters against standard FSSAI hot/cold holding guidelines (hot food >60°C, cold food <5°C, danger zone 5°C–60°C max 2-4 hours).`;

      parts.push({ text: textPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              visualFreshnessObservations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Preliminary visual observations regarding texture, surface moisture, color consistency, and container cleanliness.',
              },
              possibleQualityConcerns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Any potential thermal danger-zone risks, holding duration warnings, or packaging concerns.',
              },
              missingSafetyInformation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific food safety parameters still required (e.g. core probe thermometer reading, allergen tags, batch cool-down log).',
              },
              recommendedNextInspectionSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Concrete physical verification steps the authorized human inspector must perform before signing off.',
              },
              riskLevelIndicator: {
                type: Type.STRING,
                description: 'One of: "Standard Physical Verification Required", "Elevated Thermal/Holding Attention Required", or "High Risk - Recommend Detailed Lab/Organoleptic Check".',
              },
              mandatorySafetyDisclaimer: {
                type: Type.STRING,
                description: 'Clear disclaimer stating AI cannot certify food safety and human physical inspection is required.',
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: any) {
      console.error('Gemini Food Inspection Error:', error);
      res.status(error?.status || 500).json({
        error: error?.message || 'Failed to generate AI food quality observations.',
      });
    }
  });

  // 3. Role-Specific AI Sustainability & Operational Recommendations
  app.post('/api/ai/recommendations', async (req: Request, res: Response) => {
    try {
      const ai = getGenAIClient();
      const { role, contextData } = req.body;

      const prompt = `You are ReBite's Campus Sustainability & Food Operations AI Strategist for an Indian college campus.
Generate 4 highly specific, actionable recommendations for the stakeholder role: "${role}" based strictly on their live operational data below:

Live Context Data:
${JSON.stringify(contextData)}

Ensure every recommendation cites real numbers or items from the provided context data, explains the operational or environmental impact, and avoids generic filler.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryInsight: {
                type: Type.STRING,
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    action: { type: Type.STRING },
                    expectedImpact: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: any) {
      console.error('Gemini Recommendations Error:', error);
      res.status(error?.status || 500).json({
        error: error?.message || 'Failed to generate AI recommendations.',
      });
    }
  });

  // 4. Natural-Language ReBite Sustainability Assistant
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const ai = getGenAIClient();
      const { message, currentRole, currentUserName, campusStateSummary } = req.body;

      const systemInstruction = `You are the ReBite AI Sustainability Assistant for an Indian college campus food waste management and redistribution platform.
Current User: ${currentUserName} (Role: ${currentRole})

Live Campus Database Snapshot:
${JSON.stringify(campusStateSummary, null, 2)}

Rules:
1. Answer questions accurately using the actual numbers, meal menus, surplus listings, canteen inventory, and NGO redistribution records in the Live Campus Database Snapshot above.
2. Clearly identify when environmental impact figures (CO2 avoided, water saved) or demand predictions are estimates based on documented calculation assumptions (1 kg food saved = 2.5 meals, 2.5 kg CO2e avoided, 850L embedded water saved).
3. Never certify food as safe to eat; always remind NGO/inspectors that physical thermometer and human sensory checks are required.
4. Keep responses concise, structured, and helpful (3-6 sentences or clean bullet points).`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: message,
        config: {
          systemInstruction,
        },
      });

      res.json({
        reply: response.text ?? 'I could not generate a response right now.',
      });
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      res.status(error?.status || 500).json({
        error: error?.message || 'Failed to reach ReBite AI Assistant.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReBite server running on http://localhost:${PORT}`);
  });
}

startServer();
