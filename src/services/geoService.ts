import { GeoData } from '../types';

const fetchWithTimeout = async (resource: string, options = {}) => {
  const { timeout = 5000 } = options as any;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
};

export const getIpData = async (): Promise<GeoData> => {
  try {
    // Primary: ipapi.co (Detailed)
    const response = await fetchWithTimeout('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Primary IP API failed');
    const data = await response.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      org: data.org,
    };
  } catch (error) {
    console.warn("Primary IP Fetch Error, trying backup...", error);
    try {
      // Fallback: ipify (Only IP) + mocked geo
      const response = await fetchWithTimeout('https://api.ipify.org?format=json');
      const data = await response.json();
      return { 
        ip: data.ip, 
        city: 'Desconhecido (Backup API)', 
        region: 'N/A', 
        org: 'N/A' 
      };
    } catch (err2) {
       console.error("All IP APIS failed", err2);
       return { ip: 'Indisponível', city: 'Erro de conexão' };
    }
  }
};

export const getBrowserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    }
  });
};
