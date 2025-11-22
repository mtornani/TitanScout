
export const KNOWN_PLAYERS = [
  "matteo vitaioli", "nicola nanni", "filippo berardi", "aldo simoncini", 
  "elia benedettini", "dante rossi", "alessandro golinucci", "enrico golinucci",
  "marcello mularoni", "lorenzo lazzari", "filippo fabbri", "tommaso benvenuti",
  "giacomo valentini", "michele cevoli", "alessandro d'addario", "mirko palazzi",
  "andy selva", "davide simoncini", "alessandro tosi", "simone benedettini",
  "gabriel capicchioni", "davide gualtieri", "luca cecchetti", "mattia stefanelli",
  "michele nardi", "nicola della valle", "samuele zannoni", "danilo rinaldi",
  "alvin ceccoli", "marco gasperoni", "andrea grandoni", "michele cevuli",
  "edoardo colombo", "pietro amici", "matteo zavoli", "andrea contadini",
  "luca nanni", "simone franciosi", "giacomo benvenuti", "filippo berardi",
  "michael battistini", "luca ceccaroli", "andrea battistini"
];

// Domestic clubs to filter out from Wikidata results
export const SAN_MARINO_CLUBS = [
  "Tre Penne", "La Fiorita", "Tre Fiori", "Virtus", "Folgore", "Domagnano", 
  "Faetano", "Libertas", "Murata", "Pennarossa", "San Giovanni", "Cailungo", 
  "Fiorentino", "Juvenes", "Dogana", "Juvenes/Dogana", "Cosmos", 
  "San Marino Academy", "Victor San Marino", "San Marino Calcio", 
  "Tropical Coriano", "Asar", "A.S.A.R.", "San Marino national football team",
  "Nazionale di calcio di San Marino", "San Marino national under-21 football team",
  "San Marino national under-19 football team", "San Marino national under-17 football team",
  "Nazionale Under-21", "Nazionale U21", "Nazionale U-21", "Nazionale U19", 
  "Nazionale U17", "San Marino U21", "San Marino U19", "San Marino U17",
  "San Marino Calcio U19"
];

// SPARQL Query GENEALOGICA (Deep Lineage)
// STRICT FILTER: Year of Birth >= 1990 to exclude retired legends like Massimo Bonini
export const WIKIDATA_QUERY = `
SELECT DISTINCT ?player ?playerLabel ?dob ?placeOfBirthLabel ?teamLabel ?leagueLabel ?image ?citizenshipLabel ?positionLabel WHERE {
  ?player wdt:P31 wd:Q5;                 # Instance of Human
          wdt:P106 wd:Q937857.           # Occupation: Association Football Player
  
  { ?player wdt:P27 wd:Q238. }           # Option A: Citizenship San Marino
  UNION
  { ?player wdt:P19 wd:Q238. }           # Option B: Born in San Marino
  UNION
  { ?player wdt:P22 ?father. ?father wdt:P27 wd:Q238. } # Option C: Father is SM Citizen
  UNION
  { ?player wdt:P25 ?mother. ?mother wdt:P27 wd:Q238. } # Option D: Mother is SM Citizen
  
  OPTIONAL { ?player wdt:P569 ?dob. }
  FILTER(YEAR(?dob) >= 1990)             # STRICT FILTER: Exclude players born before 1990
  
  OPTIONAL { ?player wdt:P19 ?placeOfBirth. }
  OPTIONAL { ?player wdt:P54 ?team. }
  OPTIONAL { ?team wdt:P118 ?league. }
  OPTIONAL { ?player wdt:P18 ?image. }
  OPTIONAL { ?player wdt:P27 ?citizenship. }
  OPTIONAL { ?player wdt:P413 ?position. }

  FILTER NOT EXISTS { ?player wdt:P570 ?death. } # Exclude Deceased
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,it". }
}
LIMIT 200
`;

// Extended Historical Surname List for Onomastic Radar
export const SAMMARINESE_SURNAMES = [
  "Andreini", "Bacciocchi", "Battistini", "Benedettini", "Bernardi", 
  "Berardi", "Bianchi", "Bugli", "Canini", "Capicchioni", 
  "Casadei", "Cecchetti", "Ceci", "Ciavatta", "Conti", 
  "Crescentini", "Della Valle", "Ercolani", "Fabbri", "Faetanini", 
  "Fantini", "Felici", "Francini", "Gasperoni", "Gatti", 
  "Ghiotti", "Giardi", "Gobbi", "Guerra", "Guidi", 
  "Lonfernini", "Macina", "Maiani", "Manzaroli", "Marani", 
  "Matteoni", "Mazza", "Muccioli", "Mularoni", "Muraccini", 
  "Nanni", "Pasolini", "Pedini", "Pelliccioni", "Podeschi", 
  "Raschi", "Renzi", "Righi", "Rossi", "Santi", 
  "Selva", "Simoncini", "Stefanelli", "Stolfi", "Terenzi", 
  "Toccaceli", "Tomassini", "Ugolini", "Valentini", "Valli", 
  "Venturini", "Vitaioli", "Zafferani", "Zanotti", "Zonzini"
];

export const TARGET_SURNAMES = SAMMARINESE_SURNAMES; // Alias for backward compatibility if needed

// Google Dorks for Manual Intelligence - Optimized for Deep Web
export const GOOGLE_DORKS = {
    // Italy: Tuttocampo is the reference for Serie D/Eccellenza/Promozione
    ITALY_MINORS: (surname: string) => `site:tuttocampo.it "${surname}" AND ("scheda" OR "profilo") -site:fsgc.sm`,
    
    // Argentina: BDFA and Playmakerstats cover regional leagues
    ARGENTINA: (surname: string) => `(site:bdfa.com.ar OR site:playmakerstats.com) "${surname}" AND ("Argentina" OR "Buenos Aires")`,
    
    // USA: College rosters are the best source for lineage info in bios
    USA_COLLEGE: (surname: string) => `site:.edu "soccer roster" "${surname}"`,
    
    // Global: Generic fallback
    GLOBAL_RECON: (surname: string) => `"${surname}" AND "football" AND ("San Marino" OR "sammarinese") -site:wikipedia.org -site:transfermarkt.com`
};

// Coordinates for the Map
export const COUNTRY_COORDINATES: Record<string, {x: number, y: number}> = {
  "Argentina": { x: 29, y: 78 },
  "Italy": { x: 53, y: 34 },
  "San Marino": { x: 53.2, y: 33.8 }, 
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
  "Belgium": { x: 50, y: 30 },
  "Netherlands": { x: 50, y: 29 },
  "Unknown": { x: 50, y: 50 } 
};
// Wikipedia Blocklist for noise reduction
export const TEXT_BLOCKLIST = [
  "Template:", "Category:", "Wikipedia:", "Portal:", 
  "List of", "Lista di", "Nati nel", "Morti nel", "Born in", "Died in",
  "history of", "politics of", "demographics", "eurovision",
  "comuni di", "castelli di", "elezioni", "partito"
];
