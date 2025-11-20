
export interface Player {
  name: string;
  club: string;
  year_born: string | number;
  country: string;
  reasoning: string;
  source_url: string;
  found_via: string;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'system';
  text: string;
}

export enum SearchStrategy {
  SURNAME_BASE = 'SURNAME_BASE',
  ARGENTINA = 'ARGENTINA',
  USA_COLLEGE = 'USA_COLLEGE',
  TRANSFERMARKT = 'TRANSFERMARKT',
  DISCOVERY = 'DISCOVERY',
  GLOBAL_SCOUT = 'GLOBAL_SCOUT',
  FULL_SCAN = 'FULL_SCAN'
}

export interface ScoutingConfig {
  strategy: SearchStrategy;
  delayMs: number;
}
