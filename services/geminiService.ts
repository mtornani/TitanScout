
import { GoogleGenAI, Chat } from "@google/genai";
import { SearchStrategy, Player } from '../types';
import { KNOWN_PLAYERS, SAN_MARINO_CLUBS } from '../constants';

// Initialize API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SCOUT_MODEL_NAME = "gemini-2.5-flash";
const CHAT_MODEL_NAME = "gemini-3-pro-preview";

// Singleton chat session
let chatSession: Chat | null = null;

const extractJson = (text: string): any[] => {
  try {
    // Attempt to find the JSON array pattern [ ... ]
    const match = text.match(/\[([\s\S]*)\]/);
    
    if (match) {
      return JSON.parse(match[0]);
    }
    
    // Fallback: try parsing the whole text
    return JSON.parse(text);
  } catch (e) {
    console.warn("JSON Extraction failed", e);
    return [];
  }
};

export const getChatResponse = async (message: string): Promise<string> => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: CHAT_MODEL_NAME,
      config: {
        systemInstruction: `You are the FSGC Titan Scout AI Assistant. Your role is to assist scouts in finding information about players eligible for the San Marino national team (Sammarinese citizenship or heritage). 
        
        You are professional, concise, and helpful. 
        You have access to Google Search to find real-time information. 
        When you provide facts about players (age, club, stats), strictly use the Grounding / Search tools to verify.`,
        tools: [{ googleSearch: {} }],
      }
    });
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "I didn't get a response from the scouting database.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Communications with the Titan Mainframe are currently unstable. Please try again.";
  }
};

export const resetChat = () => {
  chatSession = null;
};

export const scoutSurname = async (
  term: string,
  strategy: SearchStrategy
): Promise<Player[]> => {
  
  let searchContext = "";
  let searchQueryHint = "";

  switch (strategy) {
    case SearchStrategy.ARGENTINA:
      searchContext = `Focus specifically on lower league or youth football in Argentina (Primera C, Federal A, Reserve Leagues). We are looking for players with surname "${term}" who might have San Marino heritage.`;
      searchQueryHint = `Suggested Google Search: site:.ar ${term} futbol "inferiores" OR "reserva" OR "passaporto"`;
      break;
    case SearchStrategy.USA_COLLEGE:
      searchContext = `Focus on US College Soccer (NCAA, NAIA) rosters for the 2023-2025 seasons. Look for players with surname "${term}". Check player bios for "Parents" or "Hometown" mentioning San Marino.`;
      searchQueryHint = `Suggested Google Search: site:.edu "soccer roster 2024" ${term}`;
      break;
    case SearchStrategy.TRANSFERMARKT:
      searchContext = `Focus on football databases like Transfermarkt or Soccerway. Look for players with surname "${term}" born between 2000 and 2008 who have "San Marino" listed as citizenship.`;
      searchQueryHint = `Suggested Google Search: site:transfermarkt.com "San Marino" ${term} citizenship`;
      break;
    case SearchStrategy.DISCOVERY:
      searchContext = `Perform a broad discovery search for players of San Marino descent. The search term is: "${term}". Look for news articles, interviews, or database entries mentioning eligibility.`;
      searchQueryHint = `Suggested Google Search: ${term}`;
      break;
    case SearchStrategy.GLOBAL_SCOUT:
      searchContext = `Perform a GLOBAL search for players eligible for San Marino. Exclude players playing in San Marino. Look for players in Italy (Serie C/D), Switzerland, or other European leagues who hold dual citizenship. Term: "${term}"`;
      searchQueryHint = `Suggested Google Search: ${term} "doppia cittadinanza" calcio "San Marino" -site:fsgc.sm`;
      break;
    default: // SURNAME_BASE
      searchContext = `Search generally for active football players with surname "${term}" who are currently playing in Italy (Serie D, Eccellenza) or abroad.`;
      searchQueryHint = `Suggested Google Search: ${term} calciatore squadra attuale -${KNOWN_PLAYERS.slice(0,5).join(" -")}`;
      break;
  }

  const systemInstruction = `
    You are the Chief Scout for the FSGC (San Marino Football Federation). 
    Your mission is to find "Oriundi" - players eligible for San Marino who are NOT currently in the national team setup and NOT playing in the domestic San Marino league.
    
    CRITERIA FOR A MATCH:
    1.  Relevant to search term: "${term}".
    2.  Active Football Player (Not retired, Not a coach).
    3.  Age: Born 1993 or later (Under 32).
    4.  NOT in this exclusion list: ${KNOWN_PLAYERS.join(", ")}.
    5.  NOT playing another sport (Volleyball, Basketball, etc.).
    
    CRITICAL EXCLUSION RULES (STRICT ENFORCEMENT):
    - **EXCLUDE DOMESTIC PLAYERS**: Do NOT return players currently playing in the "Campionato Sammarinese" (San Marino Internal League). We are looking for talent ABROAD.
      - Exclude clubs: ${SAN_MARINO_CLUBS.join(", ")}.
    - **EXCLUDE FAMOUS PLAYERS**: Do NOT return famous players (e.g., Serie A, La Liga starters) unless they have explicitly documented San Marino dual citizenship.
    - **EXCLUDE CAP-TIED PLAYERS**: Do NOT return players who have already played for another National Team (e.g., Italy, Argentina) at the SENIOR level.
    - **EXCLUDE KNOWN NATIONALS**: If a player is already a known San Marino international, discard them.
    
    OUTPUT FORMAT:
    You MUST return a JSON ARRAY of objects. Do not include any conversational text outside the JSON array.
    
    JSON Structure:
    [
      {
        "name": "Full Name",
        "club": "Current Club (or Free Agent)",
        "year_born": "YYYY (or approx)",
        "country": "Country where they play (e.g., Italy, USA, Argentina)",
        "reasoning": "Brief reason why this is a good candidate (max 150 chars)",
        "source_url": "The specific URL where you found this info"
      }
    ]
    
    If no VALID candidates are found, return an empty array: [].
  `;

  const prompt = `
    CONTEXT: ${searchContext}
    ${searchQueryHint}
    
    TASK: Perform a Google Search using the suggested query or a better one you formulate. Analyze the results to find players matching the criteria.
    
    Verify the player is playing ABROAD (not in San Marino) and is eligible.
    Return the JSON array now.
  `;

  try {
    // Using gemini-2.5-flash with Google Search as requested
    const response = await ai.models.generateContent({
      model: SCOUT_MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) return [];

    // Extract URLs from grounding chunks to ensure we have a valid source
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let bestGroundingUrl = "";
    
    if (groundingChunks && groundingChunks.length > 0) {
       const webChunks = groundingChunks.filter(c => c.web?.uri);
       if (webChunks.length > 0) {
         bestGroundingUrl = webChunks[0].web?.uri || "";
       }
    }

    const players = extractJson(text);
    
    if (Array.isArray(players)) {
      return players.map((p: any) => {
        let finalUrl = p.source_url;
        if (!finalUrl || finalUrl === "N/A" || finalUrl.length < 5) {
          finalUrl = bestGroundingUrl;
        }
        
        return {
          name: p.name || "Unknown",
          club: p.club || "Unknown",
          year_born: p.year_born || "N/A",
          country: p.country || "Unknown",
          reasoning: p.reasoning || "Potential match found via search.",
          source_url: finalUrl,
          found_via: strategy
        };
      });
    }

    return [];

  } catch (error) {
    console.error(`Gemini API Error for ${term}:`, error);
    return [];
  }
};
