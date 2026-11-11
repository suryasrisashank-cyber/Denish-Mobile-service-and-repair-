import { ServiceCategory, PriceMatrix, DeviceBrand } from '../types';

export const BUSINESS_INFO = {
  name: 'DENISH',
  tagline: 'Your Mobile, Our Care',
  fullTitle: 'DENISH Mobile Repairing and Service',
  subtitle: 'All Mobile Problems | One Solution',
  phone: '8511668848',
  formattedPhone: '+91 8511668848',
  whatsappNumber: '918511668848',
  hours: 'Shop Timings: 9:00 AM – 9:00 PM (Monday to Saturday)',
  days: 'Monday – Saturday (6 Days Working)',
  warranty: 'Tested Quality Spares',
  address: 'Shop No. 4, Ground Floor, Central Mobile Market, City Center',
  guarantee: 'Fix Today • Use Tomorrow'
};

export const CORE_SERVICES: ServiceCategory[] = [
  {
    id: 'screen',
    name: 'Screen Replacement',
    subtitle: 'Display Module',
    description: 'Original AMOLED, OLED, and IPS display lamination with precise touch response calibration, gorilla glass bonding, and zero color distortion.',
    iconName: 'Smartphone',
    turnaroundTime: '30–60 Mins',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: 'OEM Grade Spares',
    badge: 'OEM Grade',
    whatsappPreset: 'Hello Denish Repair, I need Screen Replacement service for my smartphone.'
  },
  {
    id: 'battery',
    name: 'Battery Replacement',
    subtitle: 'Power System',
    description: 'High-capacity OEM lithium cells matching factory health metrics, cycle counts, overheating protection, and long-lasting standby performance.',
    iconName: 'BatteryCharging',
    turnaroundTime: '20–35 Mins',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: '100% Health Tested',
    badge: '100% Health',
    whatsappPreset: 'Hello Denish Repair, I need Battery Replacement service for my smartphone.'
  },
  {
    id: 'charging',
    name: 'Charging Problems',
    subtitle: 'Port & Circuitry',
    description: 'Type-C and Lightning connector rebuilds, power-delivery pin fixes, slow-charge resolution, and U2/Tristar charging IC micro-soldering.',
    iconName: 'Zap',
    turnaroundTime: '20–45 Mins',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: 'Fast Charge Verified',
    badge: 'Fast Charge',
    whatsappPreset: 'Hello Denish Repair, I have Charging Port or slow charging issues with my smartphone.'
  },
  {
    id: 'software',
    name: 'Software Solutions',
    subtitle: 'Firmware & OS',
    description: 'Official firmware flashing, boot-loop recovery, memory repartitioning, security lock bypass, and emergency raw data recovery.',
    iconName: 'Cpu',
    turnaroundTime: '30–50 Mins',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: 'Data Safe Protocol',
    badge: 'Data Safe',
    whatsappPreset: 'Hello Denish Repair, I need Software recovery or bootloop fix for my phone.'
  },
  {
    id: 'water',
    name: 'Water Damage Repair',
    subtitle: 'Ultrasonic De-Oxidation',
    description: 'Multi-stage ultrasonic chemical bath, rust de-oxidation, corrosion removal, trace re-tinning, and power-rail diagnostics for submerged units.',
    iconName: 'Droplets',
    turnaroundTime: '2–4 Hours',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: 'Lab Inspected',
    badge: 'Deep Clean',
    whatsappPreset: 'Hello Denish Repair, Emergency water damage service required for my phone.'
  },
  {
    id: 'ic_pcb',
    name: 'IC / PCB Repair',
    subtitle: 'Micro-Soldering Lab',
    description: 'Microscope level chip reballing, CPU & power IC jumper reconstruction, network baseband restoration, and motherboard short-circuit trace repair.',
    iconName: 'CircuitBoard',
    turnaroundTime: 'Same Day / 24h',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: 'Microscope Lab Tested',
    badge: 'Microscope Lab',
    whatsappPreset: 'Hello Denish Repair, I need Motherboard IC / Chip micro-soldering service.'
  },
  {
    id: 'speaker',
    name: 'Speaker Replacement',
    subtitle: 'Acoustic Channels',
    description: 'Distorted or low ear-piece speaker fixes, loud loudspeaker replacement, microphone noise-canceling repairs, and audio codec IC restoration.',
    iconName: 'Volume2',
    turnaroundTime: '20–30 Mins',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: 'Acoustic Calibrated',
    badge: 'Crystal Audio',
    whatsappPreset: 'Hello Denish Repair, My phone speaker or microphone is not working properly.'
  },
  {
    id: 'camera',
    name: 'Camera Replacement',
    subtitle: 'Optical Units',
    description: 'Cracked exterior sapphire camera lens replacement, blurry optical sensor repair, optical image stabilization (OIS) motor alignment, and front selfie cams.',
    iconName: 'Camera',
    turnaroundTime: '30–40 Mins',
    estimatedPriceRange: 'Contact us for service details.',
    warranty: 'Optical Tested',
    badge: 'Ultra HD',
    whatsappPreset: 'Hello Denish Repair, I need Camera lens or sensor repair for my phone.'
  }
];

export const PRICE_MATRIX: PriceMatrix = {
  screen: {
    apple: { min: 2800, max: 8500, time: '45–60 mins' },
    samsung: { min: 2200, max: 7500, time: '45–60 mins' },
    oneplus: { min: 2000, max: 6800, time: '30–45 mins' },
    xiaomi: { min: 1400, max: 4200, time: '30–45 mins' },
    realme: { min: 1400, max: 3800, time: '30–45 mins' },
    vivo_oppo: { min: 1500, max: 4500, time: '30–45 mins' },
    motorola: { min: 1600, max: 4800, time: '45 mins' },
    other: { min: 1500, max: 5000, time: '45–60 mins' }
  },
  battery: {
    apple: { min: 1400, max: 3200, time: '20–30 mins' },
    samsung: { min: 900, max: 2400, time: '20–30 mins' },
    oneplus: { min: 1100, max: 2500, time: '25 mins' },
    xiaomi: { min: 800, max: 1800, time: '20 mins' },
    realme: { min: 800, max: 1800, time: '20 mins' },
    vivo_oppo: { min: 850, max: 1900, time: '20 mins' },
    motorola: { min: 900, max: 2000, time: '25 mins' },
    other: { min: 800, max: 2200, time: '25 mins' }
  },
  charging: {
    apple: { min: 900, max: 2600, time: '30 mins' },
    samsung: { min: 600, max: 1800, time: '25 mins' },
    oneplus: { min: 700, max: 1900, time: '25 mins' },
    xiaomi: { min: 500, max: 1400, time: '20 mins' },
    realme: { min: 500, max: 1400, time: '20 mins' },
    vivo_oppo: { min: 500, max: 1500, time: '20 mins' },
    motorola: { min: 600, max: 1600, time: '25 mins' },
    other: { min: 500, max: 1800, time: '25 mins' }
  },
  software: {
    apple: { min: 500, max: 1200, time: '40 mins' },
    samsung: { min: 350, max: 900, time: '30 mins' },
    oneplus: { min: 400, max: 900, time: '30 mins' },
    xiaomi: { min: 350, max: 800, time: '30 mins' },
    realme: { min: 350, max: 800, time: '30 mins' },
    vivo_oppo: { min: 350, max: 850, time: '30 mins' },
    motorola: { min: 400, max: 900, time: '35 mins' },
    other: { min: 350, max: 1000, time: '30 mins' }
  },
  water: {
    apple: { min: 1200, max: 3500, time: '2–3 hours' },
    samsung: { min: 900, max: 2800, time: '2–3 hours' },
    oneplus: { min: 900, max: 2800, time: '2–3 hours' },
    xiaomi: { min: 800, max: 2200, time: '2 hours' },
    realme: { min: 800, max: 2200, time: '2 hours' },
    vivo_oppo: { min: 800, max: 2400, time: '2 hours' },
    motorola: { min: 850, max: 2500, time: '2 hours' },
    other: { min: 800, max: 2800, time: '2 hours' }
  },
  ic_pcb: {
    apple: { min: 1800, max: 6500, time: 'Same Day' },
    samsung: { min: 1500, max: 5500, time: 'Same Day' },
    oneplus: { min: 1400, max: 5000, time: 'Same Day' },
    xiaomi: { min: 1200, max: 3800, time: 'Same Day' },
    realme: { min: 1200, max: 3800, time: 'Same Day' },
    vivo_oppo: { min: 1200, max: 4000, time: 'Same Day' },
    motorola: { min: 1300, max: 4200, time: 'Same Day' },
    other: { min: 1200, max: 4500, time: 'Same Day' }
  },
  speaker: {
    apple: { min: 800, max: 2200, time: '30 mins' },
    samsung: { min: 500, max: 1600, time: '25 mins' },
    oneplus: { min: 600, max: 1700, time: '25 mins' },
    xiaomi: { min: 450, max: 1200, time: '20 mins' },
    realme: { min: 450, max: 1200, time: '20 mins' },
    vivo_oppo: { min: 450, max: 1300, time: '20 mins' },
    motorola: { min: 500, max: 1400, time: '25 mins' },
    other: { min: 450, max: 1500, time: '20 mins' }
  },
  camera: {
    apple: { min: 1500, max: 4800, time: '35 mins' },
    samsung: { min: 1100, max: 3800, time: '30 mins' },
    oneplus: { min: 1000, max: 3500, time: '30 mins' },
    xiaomi: { min: 800, max: 2500, time: '25 mins' },
    realme: { min: 800, max: 2400, time: '25 mins' },
    vivo_oppo: { min: 850, max: 2600, time: '25 mins' },
    motorola: { min: 900, max: 2800, time: '30 mins' },
    other: { min: 800, max: 3000, time: '30 mins' }
  }
};

export const DEVICE_BRANDS: DeviceBrand[] = [
  { id: 'apple', label: 'Apple iPhone', badge: 'Retina & Bionic' },
  { id: 'samsung', label: 'Samsung Galaxy', badge: 'Dynamic AMOLED' },
  { id: 'oneplus', label: 'OnePlus', badge: 'Fluid AMOLED' },
  { id: 'xiaomi', label: 'Xiaomi / Redmi / POCO', badge: 'HyperOS & AMOLED' },
  { id: 'realme', label: 'Realme', badge: 'Ultra Vision' },
  { id: 'vivo_oppo', label: 'Vivo / iQOO / Oppo', badge: 'Curved Display' },
  { id: 'motorola', label: 'Motorola', badge: 'Edge pOLED' },
  { id: 'other', label: 'Other Smartphone Brands', badge: 'All Androids' }
];
