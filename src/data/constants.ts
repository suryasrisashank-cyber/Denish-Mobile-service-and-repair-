import { ServiceCategory, PriceMatrix } from '../types';

export const BUSINESS_INFO = {
  name: 'DENISH',
  tagline: 'Your Mobile, Our Care',
  fullTitle: 'DENISH Mobile Repairing and Service',
  subtitle: 'All Mobile Problems | One Solution',
  phone: '8511668848',
  formattedPhone: '+91 8511668848',
  whatsappNumber: '918511668848',
  hours: '10:00 AM – 9:00 PM',
  days: 'Monday – Sunday (All 7 Days)',
  warranty: '6-Month Spares Guarantee',
  address: 'Shop No. 4, Ground Floor, Central Mobile Market, City Center',
  guarantee: 'Fix Today • Use Tomorrow Guarantee'
};

export const CORE_SERVICES: ServiceCategory[] = [
  {
    id: 'screen',
    name: 'Screen Replacement',
    subtitle: 'Display Module',
    description: 'Original AMOLED, OLED, and IPS display lamination with precise touch response calibration, gorilla glass bonding, and zero color distortion.',
    iconName: 'Smartphone',
    turnaroundTime: '30–60 Mins',
    estimatedPriceRange: '₹1,400 – ₹8,500',
    warranty: '6 Months',
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
    estimatedPriceRange: '₹800 – ₹3,200',
    warranty: '6 Months',
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
    estimatedPriceRange: '₹500 – ₹2,600',
    warranty: '3 Months',
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
    estimatedPriceRange: '₹350 – ₹1,200',
    warranty: 'Support Warranty',
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
    estimatedPriceRange: '₹800 – ₹3,500',
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
    estimatedPriceRange: '₹1,200 – ₹6,500',
    warranty: '3 Months',
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
    estimatedPriceRange: '₹450 – ₹2,200',
    warranty: '3 Months',
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
    estimatedPriceRange: '₹800 – ₹4,800',
    warranty: '6 Months',
    badge: 'Ultra HD',
    whatsappPreset: 'Hello Denish Repair, I need Camera lens or sensor repair for my phone.'
  }
];

export const PRICE_MATRIX: PriceMatrix = {
  screen: {
    apple: { min: 2800, max: 8500, time: '45–60 mins' },
    samsung: { min: 2200, max: 7500, time: '45–60 mins' },
    oneplus: { min: 2500, max: 6800, time: '45–60 mins' },
    xiaomi: { min: 1400, max: 3800, time: '30–45 mins' },
    realme: { min: 1400, max: 3600, time: '30–45 mins' },
    vivo_oppo: { min: 1500, max: 3800, time: '30–45 mins' },
    motorola: { min: 1800, max: 4200, time: '40–60 mins' },
    other: { min: 1500, max: 4000, time: '45 mins' }
  },
  battery: {
    apple: { min: 1400, max: 3200, time: '25–35 mins' },
    samsung: { min: 1100, max: 2400, time: '25–35 mins' },
    oneplus: { min: 1200, max: 2400, time: '25–35 mins' },
    xiaomi: { min: 800, max: 1600, time: '25 mins' },
    realme: { min: 800, max: 1600, time: '25 mins' },
    vivo_oppo: { min: 850, max: 1700, time: '25 mins' },
    motorola: { min: 900, max: 1800, time: '25 mins' },
    other: { min: 850, max: 1800, time: '30 mins' }
  },
  charging: {
    apple: { min: 1200, max: 2600, time: '30–45 mins' },
    samsung: { min: 700, max: 1800, time: '30 mins' },
    oneplus: { min: 800, max: 1900, time: '30 mins' },
    xiaomi: { min: 500, max: 1200, time: '20–30 mins' },
    realme: { min: 500, max: 1200, time: '20–30 mins' },
    vivo_oppo: { min: 550, max: 1300, time: '20–30 mins' },
    motorola: { min: 600, max: 1400, time: '30 mins' },
    other: { min: 600, max: 1500, time: '30 mins' }
  },
  water: {
    apple: { min: 1500, max: 3500, time: '2–4 hours' },
    samsung: { min: 1200, max: 2800, time: '2–3 hours' },
    oneplus: { min: 1200, max: 2800, time: '2–3 hours' },
    xiaomi: { min: 800, max: 1800, time: '2 hours' },
    realme: { min: 800, max: 1800, time: '2 hours' },
    vivo_oppo: { min: 800, max: 1800, time: '2 hours' },
    motorola: { min: 900, max: 2000, time: '2–3 hours' },
    other: { min: 900, max: 2200, time: '2 hours' }
  },
  ic_pcb: {
    apple: { min: 2500, max: 6500, time: 'Same Day / 24h' },
    samsung: { min: 2000, max: 5500, time: 'Same Day' },
    oneplus: { min: 2000, max: 5000, time: 'Same Day' },
    xiaomi: { min: 1200, max: 3000, time: 'Same Day' },
    realme: { min: 1200, max: 3000, time: 'Same Day' },
    vivo_oppo: { min: 1300, max: 3200, time: 'Same Day' },
    motorola: { min: 1500, max: 3500, time: 'Same Day' },
    other: { min: 1500, max: 3500, time: 'Same Day' }
  },
  speaker: {
    apple: { min: 900, max: 2200, time: '30 mins' },
    samsung: { min: 600, max: 1500, time: '25 mins' },
    oneplus: { min: 700, max: 1600, time: '25 mins' },
    xiaomi: { min: 450, max: 1100, time: '20 mins' },
    realme: { min: 450, max: 1100, time: '20 mins' },
    vivo_oppo: { min: 500, max: 1200, time: '20 mins' },
    motorola: { min: 550, max: 1300, time: '25 mins' },
    other: { min: 500, max: 1300, time: '25 mins' }
  },
  camera: {
    apple: { min: 1800, max: 4800, time: '35 mins' },
    samsung: { min: 1400, max: 4200, time: '35 mins' },
    oneplus: { min: 1300, max: 3600, time: '35 mins' },
    xiaomi: { min: 800, max: 2200, time: '30 mins' },
    realme: { min: 800, max: 2200, time: '30 mins' },
    vivo_oppo: { min: 850, max: 2400, time: '30 mins' },
    motorola: { min: 900, max: 2600, time: '30 mins' },
    other: { min: 900, max: 2600, time: '30 mins' }
  },
  software: {
    apple: { min: 600, max: 1200, time: '30–50 mins' },
    samsung: { min: 400, max: 900, time: '30 mins' },
    oneplus: { min: 450, max: 950, time: '30 mins' },
    xiaomi: { min: 350, max: 800, time: '25 mins' },
    realme: { min: 350, max: 800, time: '25 mins' },
    vivo_oppo: { min: 400, max: 850, time: '25 mins' },
    motorola: { min: 400, max: 900, time: '30 mins' },
    other: { min: 400, max: 900, time: '30 mins' }
  }
};

export const DEVICE_BRANDS = [
  { id: 'apple', label: 'Apple (iPhone / iPad)' },
  { id: 'samsung', label: 'Samsung Galaxy Series' },
  { id: 'oneplus', label: 'OnePlus' },
  { id: 'xiaomi', label: 'Xiaomi / Redmi / Poco' },
  { id: 'realme', label: 'Realme' },
  { id: 'vivo_oppo', label: 'Vivo / Oppo' },
  { id: 'motorola', label: 'Motorola / Google Pixel' },
  { id: 'other', label: 'Other Smartphone Brand' }
];
