
export const KNOWN_PLAYERS = [
  "matteo vitaioli", "nicola nanni", "filippo berardi", "aldo simoncini", 
  "elia benedettini", "dante rossi", "alessandro golinucci", "enrico golinucci",
  "marcello mularoni", "lorenzo lazzari", "filippo fabbri", "tommaso benvenuti",
  "giacomo valentini", "michele cevoli", "alessandro d'addario", "mirko palazzi",
  "andy selva", "davide simoncini", "alessandro tosi", "simone benedettini",
  "gabriel capicchioni", "davide gualtieri", "luca cecchetti", "mattia stefanelli",
  "michele nardi", "nicola della valle", "samuele zannoni", "danilo rinaldi",
  "alvin ceccoli", "marco gasperoni"
];

export const SAN_MARINO_CLUBS = [
  "Tre Penne", "La Fiorita", "Tre Fiori", "Virtus", "Folgore", "Domagnano", 
  "Faetano", "Libertas", "Murata", "Pennarossa", "San Giovanni", "Cailungo", 
  "Fiorentino", "Juvenes/Dogana", "Cosmos", "San Marino Academy"
];

export const TARGET_SURNAMES = [
  "Gasperoni", "Bernardi", "Simoncini", "Francini", "Vitaioli", 
  "Rattini", "Selva", "Guidi", "Casadei", "Valentini", "Macina", "Zafferani"
];

export const DISCOVERY_QUERIES = [
  "calciatore origine sammarinese",
  "footballer with San Marino descent",
  "soccer player eligible for San Marino national team",
  "jugador futbol ascendencia san marino",
  "calciatore madre sammarinese",
  "calciatore nonno sammarinese",
  "San Marino dual citizenship football",
  "calciatore passaporto sammarinese"
];

export const STRATEGY_LABELS: Record<string, string> = {
  SURNAME_BASE: "🧬 Base Surname Scan",
  ARGENTINA: "🇦🇷 Argentina (Youth/Lower)",
  USA_COLLEGE: "🇺🇸 USA College Rosters",
  TRANSFERMARKT: "🌍 Transfermarkt/Citizenship",
  DISCOVERY: "🔍 Broad Lineage Discovery",
  GLOBAL_SCOUT: "🌐 Global Dragnet (No RSM)",
  FULL_SCAN: "🚀 Full Multi-Vector Scan"
};

// Approximate percentages for CSS positioning on a Equirectangular projection map
export const COUNTRY_COORDINATES: Record<string, {x: number, y: number}> = {
  "Argentina": { x: 29, y: 78 },
  "Italy": { x: 53, y: 34 },
  "San Marino": { x: 53.2, y: 33.8 }, // Close to Italy
  "USA": { x: 20, y: 35 },
  "United States": { x: 20, y: 35 },
  "Brazil": { x: 32, y: 65 },
  "Germany": { x: 52, y: 30 },
  "France": { x: 49, y: 33 },
  "Spain": { x: 47, y: 36 },
  "England": { x: 48, y: 28 },
  "UK": { x: 48, y: 28 },
  "Switzerland": { x: 51, y: 33 },
  "Australia": { x: 85, y: 75 },
  "Canada": { x: 20, y: 20 },
  "Uruguay": { x: 30, y: 80 },
  "Unknown": { x: 50, y: 50 } // Middle of Atlantic roughly
};
