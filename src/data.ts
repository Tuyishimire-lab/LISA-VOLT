/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductCategory, Product } from './types';

export const CATEGORIES: ProductCategory[] = [
  {
    id: 'lighting',
    name: 'Lighting',
    description: 'Light up every room with style using our modern, elegant indoor and outdoor light fixtures.',
    image: 'https://images.unsplash.com/photo-1543083507-09827ba09fd5?q=80&w=600&auto=format&fit=crop',
    iconName: 'Lightbulb'
  },
  {
    id: 'cctv',
    name: 'CCTV Cameras',
    description: 'Protect what matters most with high-definition multi-camera security systems and smart wireless trackers.',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop',
    iconName: 'Shield'
  },
  {
    id: 'electrical',
    name: 'Electrical Accessories',
    description: 'High-quality flame-retardant wiring, multi-standard switches, socket modules, and distribution board units.',
    image: 'https://images.unsplash.com/photo-1558211583-0457b2b298db?q=80&w=600&auto=format&fit=crop',
    iconName: 'Zap'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'light-1',
    name: 'Luxury Crystal Chandelier',
    description: 'Breathtaking 8-tier crystal pendant lamp made with genuine K9 crystals. Perfect for high-ceiling living rooms, hotel lobbies, and master dining spaces to elevate elegance.',
    fullSpecs: [
      'Material: Imperial Gold and Premium K9 Crystals',
      'Socket: 12 x E14 Base (Bulbs not included)',
      'Dimensions: Diameter 80cm, Height Adjustable (80cm - 120cm)',
      'Working Voltage: AC 110V - 240V',
      'Aesthetic: Classical European Imperial detailing'
    ],
    price: 350000,
    originalPrice: 395000,
    rating: 4.9,
    reviewsCount: 34,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop',
    category: 'lighting',
    brand: 'LucentLux',
    isHot: true,
    inStock: true,
    specs: {
      Material: 'K9 Crystal, Metal',
      BaseType: 'E14 x 12',
      Dimming: 'Supportable with Dimmer Switch',
      Warranty: '2 Years'
    }
  },
  {
    id: 'light-2',
    name: 'Solar LED Outdoor Flood Light 100W',
    description: 'IP67 waterproof solar floodlight designed to operate in heavy tropical rainstorms. Built-in high-capacity LiFePO4 battery ensures continuous illumination up to 14 hours.',
    fullSpecs: [
      'Power Rating: 100W with 6500K daylight LED array',
      'Solar Panel: 6V/25W Monocrystalline silicon panel with 5m cable',
      'Battery: 3.2V / 18,000mAh durable LiFePO4 chemistry',
      'Control: Dynamic optical twilight trigger + Infrared remote control',
      'Mount: Heavy-duty powder coated metallic bracket'
    ],
    price: 65000,
    originalPrice: 75000,
    rating: 4.8,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1565538810844-1e119fea2ecf?q=80&w=600&auto=format&fit=crop',
    category: 'lighting',
    brand: 'KigaliSolar',
    isTrending: true,
    inStock: true,
    specs: {
      Waterproofing: 'IP67 rated',
      ChargingTime: '6-8 hours sunlight',
      BatteryCapacity: '18,000mAh',
      RemoteControl: 'Yes, up to 10m range'
    }
  },
  {
    id: 'light-3',
    name: 'Smart RGB Wi-Fi LED Bulb 9W',
    description: 'Smart Wi-Fi connected E27 bulbs providing 16 million color shades. Schedule, dim, and synchronize light moods over your phone or voice assistant (Tuya / Smart Life compatible).',
    fullSpecs: [
      'Power consumption: 9W (60W standard equivalent output)',
      'Luminous flux: 810 Lumens brightest setting',
      'Protocol: 2.4GHz Wi-Fi (No additional bridge hub required)',
      'Colors: Multi-color RGB spectrum + 2700K Warm White to 6500K Cool White',
      'Integrations: Amazon Alexa, Google Assistant, Tuya App, SmartLife'
    ],
    price: 15000,
    rating: 4.6,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=600&auto=format&fit=crop',
    category: 'lighting',
    brand: 'TuyaSmart',
    isNew: true,
    inStock: true,
    specs: {
      Fitting: 'E27 Screw Base',
      ServiceLife: '25,000 continuous hours',
      AppControl: 'Tuya Smart / Smart Life APP',
      BeamAngle: '220 degrees'
    }
  },
  {
    id: 'light-4',
    name: 'Modern Nordic Pendant Light Set',
    description: 'Minimalist set of 3 multi-height matching metallic pendant lamps lined with premium real oak tops. Perfect above kitchen counters, minimalist dining spaces, or hipster cafes.',
    fullSpecs: [
      'Pack: Set of 3 complete fitting fixtures in Matte Black, White, and Slate Grey',
      'Fitting: Standard E27 support up to 60W each',
      'Cable: Premium braided chord, length adjustable up to 1.5 meters',
      'Tops: Environmentally certified local FSC Oak wooden blocks',
      'Material: Hand-turned premium alloy body shell'
    ],
    price: 45000,
    originalPrice: 55000,
    rating: 4.7,
    reviewsCount: 26,
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=600&auto=format&fit=crop',
    category: 'lighting',
    brand: 'SveaStyle',
    inStock: true,
    specs: {
      Material: 'Metal, Real Oak Wood',
      NumberofBulbs: '3 x E27 fitting sockets',
      CordLength: '1.5m (Adjustable)',
      Style: 'Scandinavian Minimalist'
    }
  },
  {
    id: 'cctv-1',
    name: 'Hikvision 4-Camera HD CCTV Kit',
    description: 'All-in-one comprehensive safety perimeter surveillance bundle. Includes heavy weather analog outdoor cameras, compact recording DVR, full connectivity cables, and dedicated hard disk drive.',
    fullSpecs: [
      'Cameras: 4 x Hikvision HD 2MP Bullet Night-Vision CCTV (IP67 rates)',
      'Recording unit: 4-Channel hybrid DVR supporting 1080p full real-time recording UI',
      'Hard Disk: 1TB Surveillance grades Western Digital HDD preinstalled',
      'Cables: 4 x 20m high-shielding coaxial video and power hybrid cables',
      'Mobile streaming: Remote live view app configuration via Hik-Connect'
    ],
    price: 245000,
    originalPrice: 280000,
    rating: 4.9,
    reviewsCount: 147,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop',
    category: 'cctv',
    brand: 'Hikvision',
    isHot: true,
    inStock: true,
    specs: {
      Resolution: '1080p Full High Definition',
      NightVision: 'Infrared night vision up to 25 meters',
      Storage: '1TB Surveillance HDD Included',
      MobileApp: 'Hik-Connect (iOS & Android)'
    }
  },
  {
    id: 'cctv-2',
    name: 'EZVIZ Outdoor Smart Wireless PTZ Camera',
    description: 'Panoramic 360-degree rotation smart wireless Wi-Fi camera. Tracks motion automatically in complete pitch darkness, blasts spotlight alarms on intruders, and supports 2-way live talking.',
    fullSpecs: [
      'Imaging: 4MP QHD lens with extreme details',
      'Coverage: True 360-degree motorized pan & tilt control via APP',
      'Smart Tracking: Humanoid recognition tracking AI prevents false wind alarms',
      'Safety: Passive loud sirens with double spotlight flash triggers',
      'Local Storage: High speed MicroSD slot support up to 256GB'
    ],
    price: 70000,
    originalPrice: 85000,
    rating: 4.8,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1524338198850-8a2ff63aebd5?q=80&w=600&auto=format&fit=crop',
    category: 'cctv',
    brand: 'EZVIZ',
    isTrending: true,
    inStock: true,
    specs: {
      FieldofView: '360° Pan, 95° Tilt',
      Resolution: '2K+ Super High Def',
      Audio: 'Built-in mic and speaker (2-Way)',
      WiFi: 'Wi-Fi 2.4GHz & Ethernet Port'
    }
  },
  {
    id: 'cctv-3',
    name: 'Smart Indoor CCTV Pet & Baby Monitor',
    description: 'Peace of mind in a compact form. Full HD indoor interactive pan/tilt Wi-Fi camera with automatic baby cry alert systems, clear night sight, and thermal sensor triggers.',
    fullSpecs: [
      'Sensor: 2MP Ultra-low-light premium sensor',
      'Range: Vertical 110 degrees, Horizontal 355 degrees',
      'Audio: Extreme gain sound sensors trigger immediate baby cries alerts',
      'History: Configurable local loop record on SD or secure offsite Cloud vault',
      'Sharing: Multi-tenant screen sharing (allow up to 4 users concurrently)'
    ],
    price: 35000,
    rating: 4.5,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop',
    category: 'cctv',
    brand: 'SmartLife',
    isNew: true,
    inStock: true,
    specs: {
      AudioQuality: 'Studio 2-Way (Noise-filtered)',
      Resolution: '1080p Full HD',
      Integration: 'Alexa & Google Assistant',
      PowerSupply: 'Micro USB DC 5V/1A'
    }
  },
  {
    id: 'elec-1',
    name: 'Single-Core Copper Cable 2.5mm² (100m)',
    description: 'Premium pure copper multi-strand building cable with heavy flame-retardant PVC wrap coding. Best choice for electrical sockets routing in domestic homes and commercial build grids.',
    fullSpecs: [
      'Conductor Material: 99.9% Electrolytic grade plain annealed copper strands',
      'Insulation Layer: Custom formulation thermal PVC envelope (Flame-retardant)',
      'Dimensions: Outer nominal size 2.5mm² (100-meter continuous roll package)',
      'Standard: Matches fully BS 6004 quality assurance tests',
      'Volt limits: Rated securely up to 450/750V AC circuit systems'
    ],
    price: 75000,
    originalPrice: 85000,
    rating: 4.9,
    reviewsCount: 198,
    image: 'https://images.unsplash.com/photo-1621243804936-775306a8f2e3?q=80&w=600&auto=format&fit=crop',
    category: 'electrical',
    brand: 'KigaliWires',
    isHot: true,
    inStock: true,
    specs: {
      Conductor: '99.9% Oxygen-free Copper',
      Length: '100 meters continuous',
      Color: 'Available in Red, Black, Yellow-Green',
      MaxCurrent: '25 Amps load capacity'
    }
  },
  {
    id: 'elec-2',
    name: 'Single-Core Copper Cable 1.5mm² (100m)',
    description: 'High-safety flame-retardant standard copper wiring. Specifically optimized for stable energy distribution across high-density lighting fixtures and ceiling fans.',
    fullSpecs: [
      'Material: 99.9% oxygen-free refined copper filaments',
      'Usage: Perfect for indoor light routes, light switches, and doorbell circuits',
      'Wrap structural: Extra robust premium heat resistance shield PVC layer',
      'Certification: Full ISO 9001 and KEBS compliance certification',
      'Package: Single continuous 100-meter core drum wrap'
    ],
    price: 52000,
    rating: 4.8,
    reviewsCount: 144,
    image: 'https://images.unsplash.com/photo-1558211583-0457b2b298db?q=80&w=600&auto=format&fit=crop',
    category: 'electrical',
    brand: 'KigaliWires',
    inStock: true,
    specs: {
      Conductor: '99.9% Refined Copper',
      Length: '100 meters continuous',
      Color: 'Available in Blue, Brown, Yellow-Green',
      MaxCurrent: '16 Amps load capacity'
    }
  },
  {
    id: 'elec-3',
    name: 'Double Multi-Standard Socket with USB',
    description: 'Modern luxury double power socket featuring standard universal layout for all plug types (UK, EU, US). Built-in dual USB ports provide high-speed device charging without adapter clutter.',
    fullSpecs: [
      'Layout: 2-Gang multi-point ports supporting UK, European round and US flat pins',
      'USB: 2 x smart charging USB-A ports giving complete DC 5V/2.1A outputs',
      'Material: Tempered non-scratch black crystal acrylic glass front panel',
      'Internal contacts: Phosphorus high-conduction elastic bronze connectors',
      'Child protection: Active safety security gate sliders inner block'
    ],
    price: 12000,
    rating: 4.7,
    reviewsCount: 54,
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop',
    category: 'electrical',
    brand: 'SmartLife',
    isNew: true,
    inStock: true,
    specs: {
      RatedCurrent: '13A / 250V AC',
      USBOutput: 'DC 5.0V / 2.1A Shared',
      PanelMaterial: 'Tempered Glass Panel - Waterproof/Scratchproof',
      Size: '146mm x 86mm standard sizing'
    }
  },
  {
    id: 'elec-4',
    name: 'Distribution Board DB 12-Way Panel',
    description: 'Rugged flame-retardant terminal box designed for secure division of indoor network pathways. Standard 12-way rails preinstalled with robust transparent weather cover door.',
    fullSpecs: [
      'Rails: Fully integrated standard 35mm metallic DIN mounting rail framework',
      'Sizing: 12-way modules distribution capacity space',
      'Security: Heavy-duty self-extinguishing ABS rigid outer shell protection',
      'Lid: Impactproof transparent green tinted inspection door protector',
      'Protection: Rated waterproof/dustproof standards (IP40 indoor ratings)'
    ],
    price: 40000,
    rating: 4.6,
    reviewsCount: 31,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    category: 'electrical',
    brand: 'ABBTech',
    inStock: true,
    specs: {
      MountType: 'Flush Wall Mount',
      CapacityRating: '100A Max Busbar load',
      Standards: 'IEC 60439-3 compliant',
      InflowProtection: 'IP40 rating'
    }
  }
];

export const REVIEWS = [
  {
    id: 1,
    name: 'Jean-Paul Nkurunziza',
    rating: 5,
    date: '2026-05-12',
    comment: 'The Hikvision CCTV kit was original and cost far less than downtown shops. Lisa Volt technicians set it up at my house in Gikondo the very next day. Brilliant security service in Kigali!',
    verified: true
  },
  {
    id: 2,
    name: 'Aline Mubera',
    rating: 5,
    date: '2026-04-29',
    comment: 'Gorgeous crystal chandelier! It looks magnificent in my living room in Kiyovu. Delivery was extremely fast, and the support was extremely patient helping me choose the best warm lighting bulbs.',
    verified: true
  },
  {
    id: 3,
    name: 'Eric Manzi',
    rating: 4,
    date: '2026-05-20',
    comment: 'Top quality 2.5mm copper wires for building my house in Gasabo. Very low prices and responsive expert installers who double-checked everything. Will shop again.',
    verified: true
  }
];
