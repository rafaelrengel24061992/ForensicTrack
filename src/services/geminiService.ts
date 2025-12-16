import { GoogleGenAI } from "@google/genai";
import { Case } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateForensicReport = async (caseData: Case): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Prepare data for the model
    const logSummary = caseData.logs.map(log => `
      - Time: ${log.timestamp}
      - IP: ${log.ip}
      - ISP: ${log.geoRaw.org}
      - Location (IP): ${log.geoRaw.city}, ${log.geoRaw.region}
      - Location (GPS): ${log.gps ? `${log.gps.latitude}, ${log.gps.longitude} (Accuracy: ${log.gps.accuracy}m)` : 'Denied/Unavailable'}
      - User Agent: ${log.userAgent}
    `).join('\n');

    const prompt = `
      Act as a Digital Forensics Expert. Analyze the following access logs for Procedure #${caseData.procedureNumber}.
      
      Logs:
      ${logSummary}

      Please provide a formal technical summary containing:
      1. A summary of the access timeline.
      2. Geographic analysis (consistency between IP location and GPS if available).
      3. Technical details of the device(s) used.
      4. Any anomalies detected.
      
      Format the output as a professional text suitable for a legal report. Portuguese language.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI report. Please check your API key.";
  }
};
