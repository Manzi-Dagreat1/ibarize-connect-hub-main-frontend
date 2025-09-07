import { apiPath } from '@/lib/env';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  type: string;
  description: string;
  images: string[];
  videos: string[];
  amenities: string[];
  featured: boolean;
  status: string;
  virtualTour?: string;
  yearBuilt?: number | null;
  parking: number;
  floor: number;
  furnished: boolean;
  petFriendly: boolean;
  garden: boolean;
  balcony: boolean;
  securitySystem: boolean;
  nearbyFacilities: string[];
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  theme?: 'light' | 'dark';
  language?: string;
  currency?: string;
  notifications?: Record<string, boolean>;
}

export interface Analytics {
  totalProperties: number;
  totalViews: number;
  totalLeads: number;
  averagePrice: number;
}

// Helper to coerce API responses to correct numeric types
const normalizeProperty = (p: any): Property => ({
  ...p,
  price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price || 0),
  bedrooms: typeof p.bedrooms === 'string' ? parseInt(p.bedrooms) : Number(p.bedrooms || 0),
  bathrooms: typeof p.bathrooms === 'string' ? parseInt(p.bathrooms) : Number(p.bathrooms || 0),
  size: typeof p.size === 'string' ? parseFloat(p.size) : Number(p.size || 0),
  yearBuilt: p.yearBuilt === null || p.yearBuilt === undefined || p.yearBuilt === ''
    ? null
    : (typeof p.yearBuilt === 'string' ? parseInt(p.yearBuilt) : Number(p.yearBuilt)),
  parking: typeof p.parking === 'string' ? parseInt(p.parking) : Number(p.parking || 0),
  floor: typeof p.floor === 'string' ? parseInt(p.floor) : Number(p.floor || 0),
});

class ApiService {
  private async request(path: string, options: RequestInit = {}) {
    const url = apiPath(path);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Properties API
  async getProperties(): Promise<Property[]> {
    const data = await this.request('/api/properties');
    // Normalize numeric fields just in case backend sends strings
    return (data || []).map((p: any) => normalizeProperty(p));
  }

  async getProperty(id: string): Promise<Property> {
    const data = await this.request(`/api/properties/${id}`);
    return normalizeProperty(data);
  }

  async createProperty(propertyData: any): Promise<{ id: string; message: string }> {
    console.log('API Service - Creating property with data:', propertyData);
    console.log('API Service - Images being sent:', propertyData.images);
    console.log('API Service - Videos being sent:', propertyData.videos);
    
    const response = await fetch(apiPath('/api/properties'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Service - Property creation failed:', errorData);
      throw new Error(`Failed to create property: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Service - Property created successfully:', result);
    return result;
  }

  async updateProperty(id: string, property: Omit<Property, 'id' | 'createdAt'>): Promise<{ message: string }> {
    return this.request(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  }

  async deleteProperty(id: string): Promise<{ message: string }> {
    return this.request(`/api/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload
  async uploadFiles(files: File[], onProgress?: (progress: number) => void): Promise<{ files: Array<{ id: string; filename: string; url: string; mimetype: string; size: number; uploadedAt: string }> }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', apiPath('/api/upload'));
      xhr.send(formData);
    });
  }

  // User API
  async getUser(): Promise<User> {
    return this.request('/api/user');
  }

  async updateUser(user: Partial<User>): Promise<{ message: string }> {
    return this.request('/api/user', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  // Analytics API
  async getAnalytics(): Promise<Analytics> {
    return this.request('/api/analytics');
  }

  // Settings API
  async updateSettings(settings: Record<string, any>): Promise<{ message: string }> {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/api/health');
  }
}

export const apiService = new ApiService();
