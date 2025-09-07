// Centralized environment helpers for URLs

export const BACKEND_URL: string = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3001';
export const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL || BACKEND_URL;

export const apiPath = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};

export const mediaUrl = (urlOrPath: string): string => {
  if (!urlOrPath) return '';
  // If already absolute, return as-is
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  // Otherwise prefix with backend URL
  const normalized = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${BACKEND_URL}${normalized}`;
};
