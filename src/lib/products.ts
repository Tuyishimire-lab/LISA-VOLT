import pPendant from "@/assets/p-pendant.jpg";
import pChandelier from "@/assets/p-chandelier.jpg";
import pLedstrip from "@/assets/p-ledstrip.jpg";
import pDome from "@/assets/p-dome.jpg";
import pBullet from "@/assets/p-bullet.jpg";
import pPtz from "@/assets/p-ptz.jpg";
import pDoorbell from "@/assets/p-doorbell.jpg";
import pSwitch from "@/assets/p-switch.jpg";
import pMcb from "@/assets/p-mcb.jpg";
import pExtension from "@/assets/p-extension.jpg";
import pInverter from "@/assets/p-inverter.jpg";
import pBulb from "@/assets/p-bulb.jpg";
import pFloorlamp from "@/assets/p-floorlamp.jpg";

export type BadgeKey =
  | "HOT MODEL"
  | "TRENDING"
  | "NEW ARRIVAL"
  | "STOCK ON THE WAY"
  | "BLACK FRIDAY"
  | "BEST SELLER"
  | "LIMITED STOCK"
  | "OUT OF STOCK";

export const BADGE_CLASSES: Record<BadgeKey, string> = {
  "HOT MODEL": "bg-[var(--badge-hot)] text-white",
  TRENDING: "bg-[var(--badge-trending)] text-white",
  "NEW ARRIVAL": "bg-[var(--badge-new)] text-white",
  "STOCK ON THE WAY": "bg-[var(--badge-stock)] text-white",
  "BLACK FRIDAY": "bg-[var(--badge-bf)] text-yellow",
  "BEST SELLER": "bg-[var(--badge-best)] text-white",
  "LIMITED STOCK": "bg-[var(--badge-limited)] text-white",
  "OUT OF STOCK": "bg-[var(--badge-out)] text-white",
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: "Lighting" | "CCTV" | "Electrical";
  subcategory: string;
  badge?: BadgeKey;
  rating: number;
  reviews: number;
};

export const products: Product[] = [
  { id: "led-pendant-1", name: "Halo LED Ring Pendant", description: "Sleek modern halo-ring pendant with warm white LED, perfect for dining rooms and modern interiors in Rwanda.", price: 89000, oldPrice: 120000, image: pPendant, category: "Lighting", subcategory: "Pendant Lights", badge: "HOT MODEL", rating: 4.8, reviews: 142 },
  { id: "crystal-chandelier-8", name: "Royal 8-Arm Crystal Chandelier", description: "Elegant 8-arm crystal chandelier for spacious living rooms, hotels, and event venues — luxurious lighting that lasts.", price: 450000, image: pChandelier, category: "Lighting", subcategory: "Chandeliers", badge: "BEST SELLER", rating: 4.9, reviews: 78 },
  { id: "rgb-strip-5m", name: "RGB Smart LED Strip 5m", description: "App-controlled color-changing 5m RGB LED strip with remote and music sync — ideal for TV backlight, ceilings, and decor.", price: 35000, oldPrice: 50000, image: pLedstrip, category: "Lighting", subcategory: "LED Strip Lights", badge: "BLACK FRIDAY", rating: 4.6, reviews: 312 },
  { id: "filament-bulb-e27", name: "Vintage Filament LED Bulb E27", description: "Warm 4W Edison-style filament LED bulb, energy-saving and decorative for cafes, restaurants and home accent lighting.", price: 4500, image: pBulb, category: "Lighting", subcategory: "Light Bulbs", badge: "TRENDING", rating: 4.5, reviews: 256 },
  { id: "arc-floor-lamp", name: "Nordic Arc Floor Lamp", description: "Minimalist black Nordic arc floor lamp with marble base and dimmer — modern lighting for living rooms and reading corners.", price: 175000, image: pFloorlamp, category: "Lighting", subcategory: "Floor Lamps", badge: "NEW ARRIVAL", rating: 4.7, reviews: 41 },

  { id: "dome-2mp", name: "HD Dome Camera 2MP", description: "Indoor HD dome CCTV camera with night vision, motion alerts and mobile app — reliable security for homes and shops.", price: 65000, image: pDome, category: "CCTV", subcategory: "Dome Cameras", badge: "HOT MODEL", rating: 4.7, reviews: 198 },
  { id: "bullet-4mp", name: "Outdoor Bullet 4MP IP67", description: "Weatherproof outdoor 4MP bullet camera with IR night vision and IP67 rating — built for Rwandan weather and 24/7 use.", price: 95000, oldPrice: 130000, image: pBullet, category: "CCTV", subcategory: "Bullet Cameras", badge: "BLACK FRIDAY", rating: 4.8, reviews: 167 },
  { id: "ptz-speed-dome", name: "PTZ Speed Dome 20x Zoom", description: "Auto-tracking pan-tilt-zoom outdoor PTZ camera with 20x optical zoom — perfect for compounds, warehouses and parking lots.", price: 380000, image: pPtz, category: "CCTV", subcategory: "PTZ Cameras", badge: "BEST SELLER", rating: 4.9, reviews: 52 },
  { id: "doorbell-pro", name: "Smart Video Doorbell Pro", description: "1080p smart video doorbell with two-way audio, motion detection and cloud recording — see visitors from anywhere.", price: 110000, image: pDoorbell, category: "CCTV", subcategory: "Doorbell Cameras", badge: "NEW ARRIVAL", rating: 4.6, reviews: 89 },

  { id: "smart-switch-1g", name: "WiFi Smart Touch Switch 1-Gang", description: "Voice and app-controlled WiFi smart wall switch — works with Tuya, Alexa and Google Assistant for modern smart homes.", price: 18000, image: pSwitch, category: "Electrical", subcategory: "Smart Switches", badge: "TRENDING", rating: 4.5, reviews: 234 },
  { id: "mcb-32a", name: "MCB Circuit Breaker 32A 2P", description: "C-curve 32A 2-pole miniature circuit breaker for residential and commercial distribution boards — safe overload protection.", price: 7500, image: pMcb, category: "Electrical", subcategory: "Circuit Protection", rating: 4.7, reviews: 88 },
  { id: "ext-6way-surge", name: "6-Way Extension with Surge Protection", description: "6-way universal extension with surge protection, USB ports and 3m cord — safe power for offices and home electronics.", price: 22000, oldPrice: 32000, image: pExtension, category: "Electrical", subcategory: "Extension Solutions", badge: "LIMITED STOCK", rating: 4.6, reviews: 311 },
  { id: "solar-inverter-3kw", name: "Solar Hybrid Inverter 3KW", description: "3KW solar hybrid inverter with MPPT and pure sine wave output — reliable backup power for homes and small offices.", price: 850000, image: pInverter, category: "Electrical", subcategory: "Solar & Energy", badge: "STOCK ON THE WAY", rating: 4.8, reviews: 24 },
];

export const categoryTree = [
  {
    name: "Lighting",
    subs: [
      "Ceiling Lights", "Recessed & Panel Lights", "Wall Lights", "Table & Floor Lamps",
      "Kitchen & Cabinet Lights", "LED Strip & Accent Lights", "Decorative & Mood Lights",
      "Smart Home Lights", "Outdoor Home Lights", "Emergency & Utility Lights", "Light Bulbs",
    ],
  },
  {
    name: "CCTV",
    subs: [
      "Indoor Cameras", "Outdoor Cameras", "PTZ Cameras", "Wireless / WiFi Cameras",
      "Doorbell & Entrance Cameras", "Recording Systems (DVR/NVR)", "Specialized Cameras",
      "CCTV Accessories",
    ],
  },
  {
    name: "Electrical",
    subs: [
      "Smart Home Controls", "Music & Entertainment Controllers", "Lighting Controllers",
      "Cables & Wires", "Switches & Sockets", "Circuit Protection", "Conduits & Cable Management",
      "Extension & Power Solutions", "Automation & Sensors", "Solar & Energy",
      "Electrical Tools & Testing", "Networking & Data",
    ],
  },
] as const;

export const formatRWF = (n: number) =>
  new Intl.NumberFormat("en-RW").format(n) + " RWF";
