
export interface Player {
  id: string;
  name: string;
  club: string;
  league?: string;
  position?: string;
  citizenship?: string;
  year_born: string | number;
  country: string;
  reasoning: string;
  source_url: string;
  image_url?: string;
  verified: boolean;
  discovery_method: 'GRAPH' | 'TEXT'; // New field to track source
}

export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'system';
  text: string;
}

export enum DataSource {
  WIKIDATA_LIVE = 'WIKIDATA_LIVE',
  MANUAL_DORK = 'MANUAL_DORK'
}

export interface ScoutingConfig {
  minAge: number;
  maxAge: number;
}
