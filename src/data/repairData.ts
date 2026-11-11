export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  glowColor: string;
  borderColor: string;
  badge: string;
  symptoms: string[];
  turnaroundNote: string;
}

export interface BrandItem {
  name: string;
  category: string;
}

export interface FaqItem {
  category?: string;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  customerName: string;
  deviceModel: string;
  repairService: string;
  comment: string;
  rating: number;
  date: string;
  isVerified: boolean;
}

/**
 * CLIENT NOTE:
 * Strictly approved real customer reviews only.
 * Kept empty until real business owner-approved reviews are provided.
 */
export const APPROVED_TESTIMONIALS: TestimonialItem[] = [];

export const BUSINESS_CONFIG = {
  name: "DENISH MOBILE REPAIRING AND SERVICE",
  shortName: "DENISH MOBILE REPAIR",
  phoneDisplay: "+91 85116 68848",
  phoneRaw: "8511668848",
  phoneTel: "tel:+918511668848",
  whatsappNumber: "918511668848",
  whatsappUrl: "https://wa.me/918511668848?text=Hello%20Denish%20Mobile%20Repairing,%20I%20would%20like%20to%20enquire%20about%20mobile%20repair%20service.",
  tagline: "Your Mobile, Our Care.",
  supportingTagline: "All Mobile Problems | One Solution.",
  motto: "Fix Today • Use Tomorrow",
  badges: ["Fast", "Reliable", "Affordable"],
  highlights: [
    "Tested Quality Replacement Parts",
    "Skilled Technical Service",
    "Efficient Turnaround",
    "Dedicated Customer Care",
  ],
  // Note: Client to configure their exact street address.
  locationPlaceholder: "Gandhinagar (Visit by appointment or call before arriving)",
  locationAdvisory: "Shop Location: Gandhinagar. Full shop address pending client confirmation. Visit by appointment or call before arriving.",
  city: "Gandhinagar",
  state: "Gujarat, India",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117511.45892789124!2d72.50742525!3d23.0120338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  googleMapsDirectUrl: "https://www.google.com/maps/search/?api=1&query=DENISH+MOBILE+REPAIRING+AND+SERVICE+Gandhinagar+Gujarat",
  hoursPlaceholder: "Shop Timings: 9:00 AM – 9:00 PM (Monday to Saturday)",
};

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: "screen-replacement",
    title: "Screen Replacement",
    shortDesc: "Cracked glass, black screen, touchscreen responsiveness issues, or display lines.",
    fullDesc: "We provide replacement for OLED, AMOLED, and LCD displays. Each installation is tested for touch response and visual clarity before return.",
    iconName: "Smartphone",
    glowColor: "text-amber-400 border-amber-500/40 shadow-amber-500/20 bg-amber-950/30",
    borderColor: "hover:border-amber-500/60",
    badge: "Display Service",
    symptoms: ["Cracked outer glass", "Green or colored vertical lines", "Unresponsive touch areas", "Black screen with sound"],
    turnaroundNote: "Contact us for turnaround estimate based on your phone model",
  },
  {
    id: "battery-replacement",
    title: "Battery Replacement",
    shortDesc: "Rapid battery draining, unexpected shutdowns, slow charging, or swelling battery.",
    fullDesc: "Battery replacement using tested replacement cells to help restore dependable daily battery runtime.",
    iconName: "Battery",
    glowColor: "text-cyan-400 border-cyan-500/40 shadow-cyan-500/20 bg-cyan-950/30",
    borderColor: "hover:border-cyan-500/60",
    badge: "Power Service",
    symptoms: ["Draining fast during normal use", "Phone shuts down abruptly", "Battery swelling visible", "Device warming up during charging"],
    turnaroundNote: "Contact us for turnaround estimate based on your phone model",
  },
  {
    id: "charging-problem",
    title: "Charging Problem Repair",
    shortDesc: "Loose charging port, cable falling out, slow charging, or phone not taking charge.",
    fullDesc: "Inspection and repair of USB Type-C, Lightning, and Micro-USB charging ports and sub-board connections.",
    iconName: "Zap",
    glowColor: "text-amber-400 border-amber-500/40 shadow-amber-500/20 bg-amber-950/30",
    borderColor: "hover:border-amber-500/60",
    badge: "Port & Hardware",
    symptoms: ["Cable must be held at an angle", "Slow charging notification", "Loose port connection", "No charging indicator"],
    turnaroundNote: "Contact us for turnaround estimate based on your phone model",
  },
  {
    id: "software-solutions",
    title: "Software Solutions",
    shortDesc: "Phone stuck on logo, bootloops, system crashes, or sluggish performance.",
    fullDesc: "Firmware diagnosis, system restoration, and recovery assistance across Android and iOS devices.",
    iconName: "Cpu",
    glowColor: "text-cyan-400 border-cyan-500/40 shadow-cyan-500/20 bg-cyan-950/30",
    borderColor: "hover:border-cyan-500/60",
    badge: "OS & System",
    symptoms: ["Stuck on manufacturer logo", "Continuous rebooting loop", "Storage full warning causing freeze", "System app crashes"],
    turnaroundNote: "Contact us for turnaround estimate based on your phone model",
  },
  {
    id: "water-damage-repair",
    title: "Water Damage Repair",
    shortDesc: "Accidental water immersion, rain splash, moisture damage, or corrosion cleaning.",
    fullDesc: "Ultrasonic cleaning to address internal moisture and corrosion, followed by electrical circuit inspection.",
    iconName: "Droplets",
    glowColor: "text-amber-400 border-amber-500/40 shadow-amber-500/20 bg-amber-950/30",
    borderColor: "hover:border-amber-500/60",
    badge: "Moisture Care",
    symptoms: ["Dropped in water or liquid", "Moisture inside camera lens", "Phone overheating after liquid contact", "No display or audio after moisture"],
    turnaroundNote: "Inspection required before confirming repair feasibility",
  },
  {
    id: "ic-pcb-repair",
    title: "IC / PCB Repair",
    shortDesc: "Dead motherboard, power IC failure, audio IC issue, network IC fault, or short circuit.",
    fullDesc: "Circuit board diagnostics, micro-soldering, and chip-level repair for complex hardware faults.",
    iconName: "Wrench",
    glowColor: "text-cyan-400 border-cyan-500/40 shadow-cyan-500/20 bg-cyan-950/30",
    borderColor: "hover:border-cyan-500/60",
    badge: "Micro-Soldering",
    symptoms: ["Completely dead phone with no power draw", "No cellular network detected", "Audio greyed out", "Overheating circuit board"],
    turnaroundNote: "Detailed bench diagnosis required for time estimate",
  },
  {
    id: "speaker-replacement",
    title: "Speaker Replacement",
    shortDesc: "Low call volume, cracked audio, buzzing sound, or completely silent loudspeaker.",
    fullDesc: "Replacement of earpiece receivers, loudspeakers, and microphone modules to restore clear audio.",
    iconName: "Volume2",
    glowColor: "text-amber-400 border-amber-500/40 shadow-amber-500/20 bg-amber-950/30",
    borderColor: "hover:border-amber-500/60",
    badge: "Audio Care",
    symptoms: ["Cannot hear caller clearly", "Crackling or distorted sound", "Microphone not picking up speech", "No sound from speaker"],
    turnaroundNote: "Contact us for turnaround estimate based on your phone model",
  },
  {
    id: "camera-replacement",
    title: "Camera Replacement",
    shortDesc: "Cracked camera glass, blurry focus, black camera screen, or camera app freezing.",
    fullDesc: "Replacement of camera lenses and camera modules to restore clear photo and video capture.",
    iconName: "Camera",
    glowColor: "text-cyan-400 border-cyan-500/40 shadow-cyan-500/20 bg-cyan-950/30",
    borderColor: "hover:border-cyan-500/60",
    badge: "Optics & Lens",
    symptoms: ["Camera refuses to focus", "Dark spots or cracks in photos", "External camera lens broken", "Black screen when launching camera"],
    turnaroundNote: "Contact us for turnaround estimate based on your phone model",
  },
];

export const BRANDS = [
  "Apple iPhone",
  "Samsung",
  "OnePlus",
  "Xiaomi / Redmi",
  "Vivo",
  "Oppo",
  "Realme",
  "Motorola",
  "Google Pixel",
  "Nothing Phone",
  "iQOO",
  "Poco",
];

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Physical Inspection",
    description: "Comprehensive chassis, frame alignment, and multi-point visual analysis.",
  },
  {
    step: "02",
    title: "Careful Disassembly",
    description: "ESD-safe thermal extraction of delicate OLED and micro-ribbon arrays.",
  },
  {
    step: "03",
    title: "Part Restoration",
    description: "Precision fitting of display units, fresh battery cells, and micrologic ICs.",
  },
  {
    step: "04",
    title: "Final Testing",
    description: "Digitizer linearity, thermal dissipation, mic pickup, and fast charge checks.",
  },
];

export const WHY_CHOOSE_US = [
  {
    title: "Professional Presentation",
    desc: "Clean diagnostic bench, organized ESD-safe workspace, and dedicated technical care for modern high-density smartphones.",
    icon: "ShieldCheck",
  },
  {
    title: "Clear Communication",
    desc: "Direct consultation, honest assessment of device condition, practical viability feedback, and straightforward advice before starting.",
    icon: "CheckCircle2",
  },
  {
    title: "Multiple Repair Services",
    desc: "A comprehensive range of hardware and software solutions under one roof—from screen adhesives to complex IC micro-soldering.",
    icon: "Award",
  },
  {
    title: "Customer-Focused Service",
    desc: "Attentive personal support tailored to resolve your daily smartphone issues quickly, minimizing your downtime.",
    icon: "Clock",
  },
];

export const FAQS: FaqItem[] = [
  {
    category: "turnaround",
    question: "How long does a typical screen or battery replacement take?",
    answer: "Turnaround depends on component availability for your exact phone model. Common screen and battery repairs are handled promptly when parts are in stock. Please contact us with your device model for an accurate estimate.",
  },
  {
    category: "privacy",
    question: "Will my data be lost during mobile repair?",
    answer: "For standard hardware repairs such as screen, battery, and speaker replacements, user data is typically not affected. For complex firmware restoration or severely damaged motherboards, we discuss potential data preservation options with you beforehand.",
  },
  {
    category: "water",
    question: "What should I do immediately if my phone drops in water?",
    answer: "Power off the device immediately. Avoid charging it, do not connect accessories, and bring it to our workshop promptly so the board can be inspected and cleaned.",
  },
  {
    category: "ic",
    question: "Do you repair motherboard and chip-level issues?",
    answer: "Yes, we handle IC and PCB micro-soldering repairs including power circuits, audio ICs, and trace repairs following a thorough diagnostic inspection.",
  },
  {
    category: "quote",
    question: "How can I get an accurate repair estimate?",
    answer: "You can submit an enquiry via this website, call our workshop directly, or message us on WhatsApp with your phone model and symptoms for a tailored estimate.",
  },
  {
    category: "brands",
    question: "Which smartphone brands do you service?",
    answer: "We repair major smartphone brands including Apple iPhone, Samsung Galaxy, OnePlus, Xiaomi/Redmi, Vivo, Oppo, Realme, Motorola, Google Pixel, Poco, and iQOO.",
  },
  {
    category: "parts",
    question: "Are quality replacement parts used for repairs?",
    answer: "Yes, we install carefully tested OEM-grade replacement components and verify device functionality before handover.",
  },
  {
    category: "booking",
    question: "Is submitting an online enquiry a confirmed appointment?",
    answer: "Submitting an enquiry registers your repair request and generates a reference ID. Our team reviews your request and connects via WhatsApp or phone to confirm part availability and scheduling.",
  },
];
