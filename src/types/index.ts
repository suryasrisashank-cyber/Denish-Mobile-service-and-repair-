export type RepairStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface RepairOrder {
  id: string;
  serviceId: string; // 10-digit normalized phone number
  customerName: string;
  phone: string;
  brand: string;
  model: string;
  serviceType: string;
  issueDescription: string;
  estimatedPrice?: string;
  status: RepairStatus;
  adminMessage?: string;
  adminUpdatedAt?: string;
  createdAt: string;
  source: 'website' | 'admin';
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ServiceCategory {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  turnaroundTime: string;
  estimatedPriceRange: string;
  warranty: string;
  badge: string;
  whatsappPreset: string;
}

export interface BrandPriceMap {
  [brandKey: string]: {
    min: number;
    max: number;
    time: string;
  };
}

export interface PriceMatrix {
  [issueKey: string]: BrandPriceMap;
}

export interface DeviceBrand {
  id: string;
  label: string;
  badge: string;
}

