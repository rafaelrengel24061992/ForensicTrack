export interface GeoData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  org?: string; // ISP
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userAgent: string;
  ip: string;
  geoRaw: GeoData; // Data from IP API
  gps?: { // Precise data from browser API
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  consentGiven: boolean;
}

export interface Case {
  id: string;
  procedureNumber: string; // Número do inquérito/procedimento
  description: string;
  destinationUrl?: string; // URL para redirecionamento após coleta
  createdAt: string;
  status: 'active' | 'closed';
  logs: AccessLog[];
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  CREATE_CASE = 'create-case',
  CASE_DETAIL = 'case-detail',
  TRACKING_CONSENT = 'tracking-consent'
}
