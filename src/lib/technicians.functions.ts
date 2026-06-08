import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

function checkToken(token: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) throw new Error("ADMIN_TOKEN not configured in backend secrets");
  if (token.length !== expected.length) throw new Error("Unauthorized");
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) throw new Error("Unauthorized");
}

const DEFAULT_TECHNICIANS = [
  {
    name: 'Jean-Paul Habimana',
    initials: 'JH',
    specialty: 'Electrician' as const,
    years: 12,
    areas: ['Kigali', 'Kicukiro', 'Gasabo'],
    rating: 4.9,
    ratings: 184,
    phone: '+250 788 100 001',
    whatsapp: '250788100001',
    status: 'Available Now' as const,
    color: '#F5C300',
    skills: [
      'House Wiring & Rewiring',
      'Distribution Board Installation',
      'Circuit Breaker Installation',
      'Socket & Switch Installation',
      'Security Lighting Setup',
      'Generator & Inverter Connection',
      'Solar System Installation',
      'Fault Finding & Repairs',
      'Earthing & Grounding',
      'Industrial Wiring'
    ],
    sort_order: 1
  },
  {
    name: 'Aline Mukamana',
    initials: 'AM',
    specialty: 'CCTV Installer' as const,
    years: 8,
    areas: ['Kigali', 'Nyarugenge'],
    rating: 4.8,
    ratings: 132,
    phone: '+250 788 100 002',
    whatsapp: '250788100002',
    status: 'Available Now' as const,
    color: '#4F9DDE',
    skills: [
      'CCTV Camera Installation',
      'DVR / NVR Setup & Configuration',
      'IP Camera Network Setup',
      'Cable Routing & Concealment',
      'Remote Viewing Setup (Phone / PC)',
      'PTZ Camera Programming',
      'CCTV System Maintenance',
      'Access Control Installation',
      'Intercom & Video Doorbell Setup',
      'CCTV Upgrade & Expansion'
    ],
    sort_order: 2
  },
  {
    name: 'Eric Niyonsenga',
    initials: 'EN',
    specialty: 'Lighting Specialist' as const,
    years: 6,
    areas: ['Kigali', 'Musanze'],
    rating: 4.7,
    ratings: 96,
    phone: '+250 788 100 003',
    whatsapp: '250788100003',
    status: 'Busy' as const,
    color: '#E07A5F',
    skills: [
      'LED Lighting Installation',
      'Chandelier & Pendant Fitting',
      'Smart Lighting Setup & Programming',
      'LED Strip & Cove Lighting',
      'Outdoor & Garden Lighting',
      'Floodlight Installation',
      'Downlight & Panel Light Fitting',
      'Lighting Control Systems',
      'Energy-Saving Lighting Consultation',
      'Lighting Design & Layout Planning'
    ],
    sort_order: 3
  },
  {
    name: 'Patrick Uwimana',
    initials: 'PU',
    specialty: 'Electrician' as const,
    years: 15,
    areas: ['Kigali', 'Huye', 'Rubavu'],
    rating: 5.0,
    ratings: 221,
    phone: '+250 788 100 004',
    whatsapp: '250788100004',
    status: 'Available Now' as const,
    color: '#81B29A',
    skills: [
      'House Wiring & Rewiring',
      'Distribution Board Installation',
      'Circuit Breaker Installation',
      'Socket & Switch Installation',
      'Security Lighting Setup',
      'Generator & Inverter Connection',
      'Solar System Installation',
      'Fault Finding & Repairs',
      'Earthing & Grounding',
      'Industrial Wiring'
    ],
    sort_order: 4
  },
  {
    name: 'Claudine Iradukunda',
    initials: 'CI',
    specialty: 'CCTV Installer' as const,
    years: 5,
    areas: ['Kigali', 'Rwamagana'],
    rating: 4.6,
    ratings: 74,
    phone: '+250 788 100 005',
    whatsapp: '250788100005',
    status: 'Offline' as const,
    color: '#9B5DE5',
    skills: [
      'CCTV Camera Installation',
      'DVR / NVR Setup & Configuration',
      'IP Camera Network Setup',
      'Cable Routing & Concealment',
      'Remote Viewing Setup (Phone / PC)',
      'PTZ Camera Programming',
      'CCTV System Maintenance',
      'Access Control Installation',
      'Intercom & Video Doorbell Setup',
      'CCTV Upgrade & Expansion'
    ],
    sort_order: 5
  },
  {
    name: 'Samuel Ndayisaba',
    initials: 'SN',
    specialty: 'Lighting Specialist' as const,
    years: 10,
    areas: ['Kigali', 'Muhanga'],
    rating: 4.8,
    ratings: 158,
    phone: '+250 788 100 006',
    whatsapp: '250788100006',
    status: 'Available Now' as const,
    color: '#F5C300',
    skills: [
      'LED Lighting Installation',
      'Chandelier & Pendant Fitting',
      'Smart Lighting Setup & Programming',
      'LED Strip & Cove Lighting',
      'Outdoor & Garden Lighting',
      'Floodlight Installation',
      'Downlight & Panel Light Fitting',
      'Lighting Control Systems',
      'Energy-Saving Lighting Consultation',
      'Lighting Design & Layout Planning'
    ],
    sort_order: 6
  }
];

async function seedInitialTechnicians() {
  const collectionRef = collection(db, "technicians");
  try {
    for (let i = 0; i < DEFAULT_TECHNICIANS.length; i++) {
      const tech = DEFAULT_TECHNICIANS[i];
      const docId = `tech-${i + 1}`;
      await setDoc(doc(collectionRef, docId), {
        id: docId,
        ...tech,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "technicians");
  }
}

export const listTechniciansPublic = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const colRef = collection(db, "technicians");
    let snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      await seedInitialTechnicians();
      snapshot = await getDocs(colRef);
    }
    const rows = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        initials: data.initials || "",
        specialty: data.specialty || "Electrician",
        years: Number(data.years) || 0,
        areas: Array.isArray(data.areas) ? data.areas : [],
        rating: Number(data.rating) || 5.0,
        ratings: Number(data.ratings) || 0,
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        status: data.status || "Available Now",
        color: data.color || "#F5C300",
        skills: Array.isArray(data.skills) ? data.skills : [],
        sort_order: Number(data.sort_order) || 0,
      };
    });
    rows.sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
    return { rows };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "technicians");
    return { rows: [] };
  }
});

const TokenOnly = z.object({ token: z.string().min(1).max(200) });

export const adminListTechnicians = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenOnly.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const colRef = collection(db, "technicians");
      let snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        await seedInitialTechnicians();
        snapshot = await getDocs(colRef);
      }
      const rows = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || "",
          initials: d.initials || "",
          specialty: d.specialty || "Electrician",
          years: Number(d.years) || 0,
          areas: Array.isArray(d.areas) ? d.areas : [],
          rating: Number(d.rating) || 5.0,
          ratings: Number(d.ratings) || 0,
          phone: d.phone || "",
          whatsapp: d.whatsapp || "",
          status: d.status || "Available Now",
          color: d.color || "#F5C300",
          skills: Array.isArray(d.skills) ? d.skills : [],
          sort_order: Number(d.sort_order) || 0,
        };
      });
      rows.sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
      return { rows };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "technicians");
      return { rows: [] };
    }
  });

const TechFields = z.object({
  name: z.string().trim().min(1).max(120),
  initials: z.string().trim().min(1).max(4),
  specialty: z.enum(["Electrician", "CCTV Installer", "Lighting Specialist"]),
  years: z.number().int().min(0).max(80),
  areas: z.array(z.string().trim().min(1).max(60)).max(30),
  rating: z.number().min(0).max(5),
  ratings: z.number().int().min(0).max(100000),
  phone: z.string().trim().min(1).max(40),
  whatsapp: z.string().trim().min(1).max(20),
  status: z.enum(["Available Now", "Busy", "Offline"]),
  color: z.string().trim().min(1).max(20),
  skills: z.array(z.string().trim().min(1).max(120)).max(100),
  sort_order: z.number().int().min(0).max(100000).optional(),
});

const CreateSchema = z.object({ token: z.string().min(1).max(200), fields: TechFields });
const UpdateSchema = z.object({
  token: z.string().min(1).max(200),
  id: z.string().trim().min(1).max(128),
  fields: TechFields.partial(),
});
const DeleteSchema = z.object({ token: z.string().min(1).max(200), id: z.string().trim().min(1).max(128) });

export const adminCreateTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CreateSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const colRef = collection(db, "technicians");
      const docRef = await addDoc(colRef, {
        ...data.fields,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      await setDoc(docRef, { id: docRef.id }, { merge: true });
      
      const savedDoc = await getDoc(docRef);
      const d = savedDoc.data();
      return {
        row: {
          id: docRef.id,
          name: d?.name || "",
          initials: d?.initials || "",
          specialty: d?.specialty || "Electrician",
          years: Number(d?.years) || 0,
          areas: Array.isArray(d?.areas) ? d?.areas : [],
          rating: Number(d?.rating) || 5.0,
          ratings: Number(d?.ratings) || 0,
          phone: d?.phone || "",
          whatsapp: d?.whatsapp || "",
          status: d?.status || "Available Now",
          color: d?.color || "#F5C300",
          skills: Array.isArray(d?.skills) ? d?.skills : [],
          sort_order: Number(d?.sort_order) || 0,
        }
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "technicians");
    }
  });

export const adminUpdateTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const docRef = doc(db, "technicians", data.id);
      await setDoc(docRef, {
        ...data.fields,
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      const savedDoc = await getDoc(docRef);
      const d = savedDoc.data();
      return {
        row: {
          id: docRef.id,
          name: d?.name || "",
          initials: d?.initials || "",
          specialty: d?.specialty || "Electrician",
          years: Number(d?.years) || 0,
          areas: Array.isArray(d?.areas) ? d?.areas : [],
          rating: Number(d?.rating) || 5.0,
          ratings: Number(d?.ratings) || 0,
          phone: d?.phone || "",
          whatsapp: d?.whatsapp || "",
          status: d?.status || "Available Now",
          color: d?.color || "#F5C300",
          skills: Array.isArray(d?.skills) ? d?.skills : [],
          sort_order: Number(d?.sort_order) || 0,
        }
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `technicians/${data.id}`);
    }
  });

export const adminDeleteTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const docRef = doc(db, "technicians", data.id);
      await deleteDoc(docRef);
      return { ok: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `technicians/${data.id}`);
    }
  });

const RateSchema = z.object({
  id: z.string().trim().min(1).max(128),
  rating: z.number().min(1).max(5),
});

export const rateTechnicianPublic = createServerFn({ method: "POST" })
  .validator((d: unknown) => RateSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const docRef = doc(db, "technicians", data.id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error("Technician not found");
      }
      const currentData = snapshot.data();
      const currentRating = Number(currentData?.rating) || 5.0;
      const currentRatingsCount = Number(currentData?.ratings) || 0;
      
      const newRatingsCount = currentRatingsCount + 1;
      const newRating = Number(((currentRating * currentRatingsCount + data.rating) / newRatingsCount).toFixed(1));
      
      await setDoc(docRef, {
        rating: newRating,
        ratings: newRatingsCount,
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      return { ok: true, newRating, newRatingsCount };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `technicians/${data.id}`);
      throw error;
    }
  });
