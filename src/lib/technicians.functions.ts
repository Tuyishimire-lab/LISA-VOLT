import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  try {
    const rows = DEFAULT_TECHNICIANS.map((tech, i) => {
      const docId = `tech-${i + 1}`;
      return {
        id: docId,
        name: tech.name,
        initials: tech.initials,
        specialty: tech.specialty,
        years: tech.years,
        areas: tech.areas,
        rating: tech.rating,
        ratings: tech.ratings,
        phone: tech.phone,
        whatsapp: tech.whatsapp,
        status: tech.status,
        color: tech.color,
        skills: tech.skills,
        sort_order: tech.sort_order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    const { error } = await supabaseAdmin.from("technicians").upsert(rows);
    if (error) throw error;
  } catch (error) {
    console.error("Error seeding technicians into Supabase:", error);
    throw error;
  }
}

export const listTechniciansPublic = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let { data: rows, error } = await supabaseAdmin.from("technicians").select("*");
    if (error) throw error;

    if (!rows || rows.length === 0) {
      await seedInitialTechnicians();
      const res = await supabaseAdmin.from("technicians").select("*");
      if (res.error) throw res.error;
      rows = res.data || [];
    }

    const mapped = rows.map(r => ({
      id: r.id,
      name: r.name || "",
      initials: r.initials || "",
      specialty: r.specialty as "Electrician" | "CCTV Installer" | "Lighting Specialist",
      years: Number(r.years) || 0,
      areas: Array.isArray(r.areas) ? r.areas : [],
      rating: Number(r.rating) || 5.0,
      ratings: Number(r.ratings) || 0,
      phone: r.phone || "",
      whatsapp: r.whatsapp || "",
      status: r.status as "Available Now" | "Busy" | "Offline",
      color: r.color || "#F5C300",
      skills: Array.isArray(r.skills) ? r.skills : [],
      sort_order: Number(r.sort_order) || 0,
    }));

    mapped.sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
    return { rows: mapped };
  } catch (error) {
    console.error("Error listing technicians public:", error);
    return { rows: [] };
  }
});

const TokenOnly = z.object({ token: z.string().min(1).max(200) });

export const adminListTechnicians = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenOnly.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      let { data: rows, error } = await supabaseAdmin.from("technicians").select("*");
      if (error) throw error;

      if (!rows || rows.length === 0) {
        await seedInitialTechnicians();
        const res = await supabaseAdmin.from("technicians").select("*");
        if (res.error) throw res.error;
        rows = res.data || [];
      }

      const mapped = rows.map(r => ({
        id: r.id,
        name: r.name || "",
        initials: r.initials || "",
        specialty: r.specialty as "Electrician" | "CCTV Installer" | "Lighting Specialist",
        years: Number(r.years) || 0,
        areas: Array.isArray(r.areas) ? r.areas : [],
        rating: Number(r.rating) || 5.0,
        ratings: Number(r.ratings) || 0,
        phone: r.phone || "",
        whatsapp: r.whatsapp || "",
        status: r.status as "Available Now" | "Busy" | "Offline",
        color: r.color || "#F5C300",
        skills: Array.isArray(r.skills) ? r.skills : [],
        sort_order: Number(r.sort_order) || 0,
      }));

      mapped.sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
      return { rows: mapped };
    } catch (error) {
      console.error("Error admin listing technicians:", error);
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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin
        .from("technicians")
        .insert({
          name: data.fields.name,
          initials: data.fields.initials,
          specialty: data.fields.specialty,
          years: data.fields.years,
          areas: data.fields.areas,
          rating: data.fields.rating,
          ratings: data.fields.ratings,
          phone: data.fields.phone,
          whatsapp: data.fields.whatsapp,
          status: data.fields.status,
          color: data.fields.color,
          skills: data.fields.skills,
          sort_order: data.fields.sort_order ?? 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (!row) throw new Error("Failed to insert technician row");

      return {
        row: {
          id: row.id,
          name: row.name || "",
          initials: row.initials || "",
          specialty: row.specialty as "Electrician" | "CCTV Installer" | "Lighting Specialist",
          years: Number(row.years) || 0,
          areas: Array.isArray(row.areas) ? row.areas : [],
          rating: Number(row.rating) || 5.0,
          ratings: Number(row.ratings) || 0,
          phone: row.phone || "",
          whatsapp: row.whatsapp || "",
          status: row.status as "Available Now" | "Busy" | "Offline",
          color: row.color || "#F5C300",
          skills: Array.isArray(row.skills) ? row.skills : [],
          sort_order: Number(row.sort_order) || 0,
        }
      };
    } catch (error) {
      console.error("Error admin creating technician:", error);
      throw error;
    }
  });

export const adminUpdateTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      if (data.fields.name !== undefined) updateData.name = data.fields.name;
      if (data.fields.initials !== undefined) updateData.initials = data.fields.initials;
      if (data.fields.specialty !== undefined) updateData.specialty = data.fields.specialty;
      if (data.fields.years !== undefined) updateData.years = data.fields.years;
      if (data.fields.areas !== undefined) updateData.areas = data.fields.areas;
      if (data.fields.rating !== undefined) updateData.rating = data.fields.rating;
      if (data.fields.ratings !== undefined) updateData.ratings = data.fields.ratings;
      if (data.fields.phone !== undefined) updateData.phone = data.fields.phone;
      if (data.fields.whatsapp !== undefined) updateData.whatsapp = data.fields.whatsapp;
      if (data.fields.status !== undefined) updateData.status = data.fields.status;
      if (data.fields.color !== undefined) updateData.color = data.fields.color;
      if (data.fields.skills !== undefined) updateData.skills = data.fields.skills;
      if (data.fields.sort_order !== undefined) updateData.sort_order = data.fields.sort_order;

      const { data: row, error } = await supabaseAdmin
        .from("technicians")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      if (!row) throw new Error("Technician row not found for update");

      return {
        row: {
          id: row.id,
          name: row.name || "",
          initials: row.initials || "",
          specialty: row.specialty as "Electrician" | "CCTV Installer" | "Lighting Specialist",
          years: Number(row.years) || 0,
          areas: Array.isArray(row.areas) ? row.areas : [], // Avoid returning undefined
          rating: Number(row.rating) || 5.0,
          ratings: Number(row.ratings) || 0,
          phone: row.phone || "",
          whatsapp: row.whatsapp || "",
          status: row.status as "Available Now" | "Busy" | "Offline",
          color: row.color || "#F5C300",
          skills: Array.isArray(row.skills) ? row.skills : [],
          sort_order: Number(row.sort_order) || 0,
        }
      };
    } catch (error) {
      console.error("Error admin updating technician:", error);
      throw error;
    }
  });

export const adminDeleteTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("technicians")
        .delete()
        .eq("id", data.id);

      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error("Error admin deleting technician:", error);
      throw error;
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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: currentData, error: fetchErr } = await supabaseAdmin
        .from("technicians")
        .select("rating, ratings")
        .eq("id", data.id)
        .single();

      if (fetchErr || !currentData) {
        throw new Error("Technician not found");
      }

      const currentRating = Number(currentData.rating) || 5.0;
      const currentRatingsCount = Number(currentData.ratings) || 0;
      
      const newRatingsCount = currentRatingsCount + 1;
      const newRating = Number(((currentRating * currentRatingsCount + data.rating) / newRatingsCount).toFixed(1));
      
      const { error: updateErr } = await supabaseAdmin
        .from("technicians")
        .update({
          rating: newRating,
          ratings: newRatingsCount,
          updated_at: new Date().toISOString()
        })
        .eq("id", data.id);

      if (updateErr) throw updateErr;
      
      return { ok: true, newRating, newRatingsCount };
    } catch (error) {
      console.error("Error rating technician public:", error);
      throw error;
    }
  });
