
import { Player } from '../types';
import { WIKIDATA_QUERY, SAN_MARINO_CLUBS, KNOWN_PLAYERS, GOOGLE_DORKS } from '../constants';

// ============================================================================
// 🧠 GEMINI AI INTEGRATION (DEPRECATED/REMOVED FOR OSINT)
// ============================================================================

export const getChatResponse = async (message: string): Promise<string> => {
    return "Titan OSINT System: AI Chat module is currently disabled in VERITAS mode to ensure data integrity.";
};

// ============================================================================
// mw FSGC TITAN HYBRID OSINT ENGINE
// ============================================================================

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const WIKIPEDIA_API_IT = 'https://it.wikipedia.org/w/api.php';
const WIKIPEDIA_API_EN = 'https://en.wikipedia.org/w/api.php';

/**
 * Helper to determine if a player is domestic based on club/league strings
 */
const isDomesticPlayer = (club: string, league: string): boolean => {
    const combined = (club + " " + league).toLowerCase();
    return SAN_MARINO_CLUBS.some(c => combined.includes(c.toLowerCase())) ||
           combined.includes("victor san marino") ||
           combined.includes("san marino calcio") ||
           combined.includes("campionato sammarinese") ||
           combined.includes("national football team") || 
           combined.includes("nazionale") ||
           combined.includes("under-21") ||
           combined.includes("under 21");
};

/**
 * GARBAGE COLLECTOR: Filters out Wikipedia noise (Dates, Lists, Generic Pages)
 */
const isGarbagePage = (title: string, snippet: string): boolean => {
    const cleanTitle = title.toLowerCase();
    const cleanSnippet = snippet.toLowerCase();
    
    // 1. BLOCK CHRONOLOGICAL LISTS & DATES
    // Blocks "Nati nel...", "Morti nel...", "Born in...", "Deaths in..."
    if (cleanTitle.includes("nati nel") || cleanTitle.includes("morti nel")) return true;
    if (cleanTitle.includes("born in") || cleanTitle.includes("deaths in")) return true;
    if (cleanTitle.includes("list of") || cleanTitle.includes("lista di")) return true;
    if (cleanTitle.includes("category:") || cleanTitle.includes("categoria:")) return true;
    if (cleanTitle.includes("albo d'oro") || cleanTitle.includes("statistiche")) return true;
    
    // Blocks dry dates/years (e.g., "1994", "October 25", "20 novembre")
    const isDate = /^\d{4}$|^(january|february|march|april|may|june|july|august|september|october|november|december|gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s?\d{0,2}$/i;
    if (isDate.test(cleanTitle)) return true;
  
    // 2. BLOCK GENERIC TERMS
    const genericTerms = [
      "san marino", "calciatore", "footballer", "association football", 
      "serie a", "serie b", "serie c", "serie d", "uefa", "fifa",
      "nazionale di calcio", "national team", "campionato", "squadra",
      "san marino national football team"
    ];
    if (genericTerms.some(term => cleanTitle === term || cleanTitle.includes("national football team"))) return true;
  
    // 3. BLOCK IRRELEVANT CONTEXT (Politics, History, Geography)
    const badContext = [
        "parrocchia", "castello", "elezioni", "partito", "census", "demographics", 
        "grand council", "capitani reggenti", "eurovision", "politics of", "history of",
        "morto il", "died in" // Extra check for death in snippet
    ];
    if (badContext.some(term => cleanSnippet.includes(term))) return true;
  
    return false; // It's likely a clean profile
};

/**
 * Scans Wikipedia Text for keywords (The "Text Pipeline")
 */
const fetchWikipediaTextCandidates = async (logs: string[]): Promise<Player[]> => {
    const candidates: Player[] = [];
    // Specific keywords that imply eligibility but might not be in the graph
    const searchTerms = [
        '"origini sammarinesi"',
        '"madre sammarinese"',
        '"padre sammarinese"',
        '"nonno sammarinese"',
        '"cittadinanza sammarinese"',
        '"passaporto sammarinese"',
        '"San Marino descent"',
        '"parents from San Marino"',
        '"grandmother from San Marino"'
    ];

    // Construct the search query (OR logic)
    const searchQuery = searchTerms.join(' OR ');

    const apis = [
        { url: WIKIPEDIA_API_IT, lang: 'it' },
        { url: WIKIPEDIA_API_EN, lang: 'en' }
    ];

    for (const api of apis) {
        try {
            logs.push(`Scanning ${api.lang.toUpperCase()} Wikipedia text for keywords...`);
            
            const params = new URLSearchParams({
                action: 'query',
                list: 'search',
                srsearch: `${searchQuery} "calciatore"`, // Ensure it's football related
                format: 'json',
                origin: '*',
                srlimit: '50'
            });

            if (api.lang === 'en') {
                params.set('srsearch', `${searchQuery} "footballer"`);
            }

            const res = await fetch(`${api.url}?${params.toString()}`);
            const data = await res.json();

            if (data.query && data.query.search) {
                for (const item of data.query.search) {
                    const title = item.title;
                    const snippet = item.snippet.replace(/<[^>]+>/g, ''); // Remove HTML tags

                    // --- GARBAGE COLLECTION ---
                    if (isGarbagePage(title, snippet)) continue;

                    // Filter out known/domestic
                    if (KNOWN_PLAYERS.some(k => title.toLowerCase().includes(k.toLowerCase()))) continue;
                    
                    // Basic exclusion of domestic clubs from snippet context
                    if (isDomesticPlayer(snippet, "")) continue;

                    candidates.push({
                        id: `wiki_text_${item.pageid}`,
                        name: title,
                        club: "Unknown (Text Match)",
                        league: "Check Biography",
                        position: "Player",
                        citizenship: "Check Bio",
                        year_born: "Check Bio",
                        country: "Text Discovery",
                        reasoning: `TEXT HIT: Snippet contains keywords: "...${snippet.substring(0, 80)}..."`,
                        source_url: `https://${api.lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                        verified: false,
                        discovery_method: 'TEXT'
                    });
                }
            }

        } catch (e) {
            console.warn(`Wiki Text Scan Error (${api.lang}):`, e);
        }
    }
    
    logs.push(`Text Pipeline found ${candidates.length} potential matches.`);
    return candidates;
};

/**
 * Executes the Live Hybrid Query (Graph + Text)
 */
export const fetchIntelligence = async (): Promise<{ players: Player[], log: string[] }> => {
    const logs: string[] = [];
    logs.push("Initializing HYBRID OSINT Protocol...");
    logs.push("Pipeline A: Wikidata Knowledge Graph (SPARQL)");
    logs.push("Pipeline B: Wikipedia Biographical Text Analysis");
    
    const processedPlayers: Map<string, Player> = new Map();

    // --- 1. EXECUTE TEXT PIPELINE (Parallel) ---
    const textPromise = fetchWikipediaTextCandidates(logs);

    // --- 2. EXECUTE GRAPH PIPELINE ---
    try {
        logs.push(`Querying Graph Endpoint: ${WIKIDATA_ENDPOINT}`);

        const cleanQuery = WIKIDATA_QUERY
            .replace(/#.*$/gm, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        const params = new URLSearchParams();
        params.append('query', cleanQuery);
        params.append('format', 'json');
        params.append('origin', '*'); 

        const response = await fetch(`${WIKIDATA_ENDPOINT}?${params.toString()}`, {
            method: 'GET',
            headers: {
                // Removed headers to ensure simple request for CORS
            }
        });

        if (!response.ok) {
            throw new Error(`Wikidata API Error: ${response.status}`);
        }

        const data = await response.json();
        const bindings = data.results.bindings;
        logs.push(`Graph Pipeline: ${bindings.length} raw entries.`);

        bindings.forEach((item: any) => {
            const name = item.playerLabel.value;
            const club = item.teamLabel ? item.teamLabel.value : "Free Agent";
            const league = item.leagueLabel ? item.leagueLabel.value : "Unknown League";
            const dob = item.dob ? item.dob.value : null;
            const placeOfBirth = item.placeOfBirthLabel ? item.placeOfBirthLabel.value : "Unknown";
            const imageUrl = item.image ? item.image.value : null;
            const wikiLink = item.player.value;
            const position = item.positionLabel ? item.positionLabel.value : "Player";
            const citizenship = item.citizenshipLabel ? item.citizenshipLabel.value : "San Marino";

            // DOMESTIC & NATIONAL TEAM FILTER
            if (isDomesticPlayer(club, league)) return;

            // KNOWN PLAYER FILTER
            if (KNOWN_PLAYERS.some(k => name.toLowerCase().includes(k.toLowerCase()))) return;

            // AGE CALCULATION
            let age = 25;
            let yearBorn = "Unknown";
            let isUnder25 = false;
            
            if (dob) {
                const birthDate = new Date(dob);
                yearBorn = birthDate.getFullYear().toString();
                const diff_ms = Date.now() - birthDate.getTime();
                const age_dt = new Date(diff_ms); 
                age = Math.abs(age_dt.getUTCFullYear() - 1970);
            }

            const isGoalkeeper = position.toLowerCase().includes("goalkeeper") || position.toLowerCase().includes("portiere");
            const maxAge = isGoalkeeper ? 40 : 33; // Strict age filter
            if (age > maxAge) return;
            
            if (age < 25) isUnder25 = true;

            // REASONING
            let eligibilityReason = `Citizenship: ${citizenship} (Verified)`;
            if (placeOfBirth.includes("San Marino") && !club.includes("San Marino")) {
                eligibilityReason = "JUS SOLI: Born in San Marino, playing abroad.";
            }

            if (isUnder25) eligibilityReason = `🔥 U25 TALENT (${age}yo). ${eligibilityReason}`;
            else eligibilityReason = `PRIME AGE (${age}yo). ${eligibilityReason}`;

            if (isGoalkeeper) eligibilityReason = `🧤 GK EXCEPTION. ${eligibilityReason}`;

            if (!processedPlayers.has(name)) {
                 processedPlayers.set(name, {
                    id: name.replace(/\s+/g, '_'),
                    name: name,
                    club: `${club} (${league})`,
                    position: position,
                    citizenship: citizenship,
                    year_born: yearBorn,
                    country: "Abroad (Verified)",
                    reasoning: eligibilityReason,
                    source_url: wikiLink,
                    image_url: imageUrl,
                    verified: true,
                    discovery_method: 'GRAPH'
                });
            }
        });

    } catch (e: any) {
        logs.push(`GRAPH ERROR: ${e.message}`);
    }

    // --- 3. MERGE TEXT RESULTS ---
    const textCandidates = await textPromise;
    textCandidates.forEach(p => {
        // Only add if not already found by the Graph (Graph is more reliable)
        if (!processedPlayers.has(p.name)) {
             processedPlayers.set(p.name, p);
        }
    });

    const finalPlayers = Array.from(processedPlayers.values());
    
    // Sort: Graph Matches first, then Text Matches. Inside that, sort by Age.
    finalPlayers.sort((a, b) => {
        if (a.discovery_method === 'GRAPH' && b.discovery_method === 'TEXT') return -1;
        if (a.discovery_method === 'TEXT' && b.discovery_method === 'GRAPH') return 1;
        
        const ageA = parseInt(a.year_born as string) || 0;
        const ageB = parseInt(b.year_born as string) || 0;
        return ageB - ageA; 
    });

    logs.push(`Sync Complete. Total Unique Candidates: ${finalPlayers.length}`);
    
    return { players: finalPlayers, log: logs };
};

/**
 * Generates manual intelligence links based on region
 */
export const generateIntelligenceLinks = (surname: string) => {
    return {
        italy: `https://www.google.com/search?q=${encodeURIComponent(GOOGLE_DORKS.ITALY_MINORS(surname))}`,
        argentina: `https://www.google.com/search?q=${encodeURIComponent(GOOGLE_DORKS.ARGENTINA(surname))}`,
        usa: `https://www.google.com/search?q=${encodeURIComponent(GOOGLE_DORKS.USA_COLLEGE(surname))}`,
        global: `https://www.google.com/search?q=${encodeURIComponent(GOOGLE_DORKS.GLOBAL_RECON(surname))}`
    };
};
