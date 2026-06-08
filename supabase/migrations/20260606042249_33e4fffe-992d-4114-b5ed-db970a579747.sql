CREATE TABLE public.technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  initials text NOT NULL,
  specialty text NOT NULL,
  years integer NOT NULL DEFAULT 0,
  areas text[] NOT NULL DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 5,
  ratings integer NOT NULL DEFAULT 0,
  phone text NOT NULL,
  whatsapp text NOT NULL,
  status text NOT NULL DEFAULT 'Available Now',
  color text NOT NULL DEFAULT '#F5C300',
  skills text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.technicians TO anon, authenticated;
GRANT ALL ON public.technicians TO service_role;

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read technicians"
  ON public.technicians FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER technicians_set_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.momo_set_updated_at();

INSERT INTO public.technicians (name, initials, specialty, years, areas, rating, ratings, phone, whatsapp, status, color, skills, sort_order) VALUES
('Jean-Paul Habimana','JH','Electrician',12,ARRAY['Kigali','Kicukiro','Gasabo'],4.9,184,'+250 788 100 001','250788100001','Available Now','#F5C300',ARRAY['House Wiring & Rewiring','Distribution Board Installation','Circuit Breaker Installation','Socket & Switch Installation','Security Lighting Setup','Generator & Inverter Connection','Solar System Installation','Fault Finding & Repairs','Earthing & Grounding','Industrial Wiring'],1),
('Aline Mukamana','AM','CCTV Installer',8,ARRAY['Kigali','Nyarugenge'],4.8,132,'+250 788 100 002','250788100002','Available Now','#4F9DDE',ARRAY['CCTV Camera Installation','DVR / NVR Setup & Configuration','IP Camera Network Setup','Cable Routing & Concealment','Remote Viewing Setup (Phone / PC)','PTZ Camera Programming','CCTV System Maintenance','Access Control Installation','Intercom & Video Doorbell Setup','CCTV Upgrade & Expansion'],2),
('Eric Niyonsenga','EN','Lighting Specialist',6,ARRAY['Kigali','Musanze'],4.7,96,'+250 788 100 003','250788100003','Busy','#E07A5F',ARRAY['LED Lighting Installation','Chandelier & Pendant Fitting','Smart Lighting Setup & Programming','LED Strip & Cove Lighting','Outdoor & Garden Lighting','Floodlight Installation','Downlight & Panel Light Fitting','Lighting Control Systems','Energy-Saving Lighting Consultation','Lighting Design & Layout Planning'],3),
('Patrick Uwimana','PU','Electrician',15,ARRAY['Kigali','Huye','Rubavu'],5.0,221,'+250 788 100 004','250788100004','Available Now','#81B29A',ARRAY['House Wiring & Rewiring','Distribution Board Installation','Circuit Breaker Installation','Socket & Switch Installation','Security Lighting Setup','Generator & Inverter Connection','Solar System Installation','Fault Finding & Repairs','Earthing & Grounding','Industrial Wiring'],4),
('Claudine Iradukunda','CI','CCTV Installer',5,ARRAY['Kigali','Rwamagana'],4.6,74,'+250 788 100 005','250788100005','Offline','#9B5DE5',ARRAY['CCTV Camera Installation','DVR / NVR Setup & Configuration','IP Camera Network Setup','Cable Routing & Concealment','Remote Viewing Setup (Phone / PC)','PTZ Camera Programming','CCTV System Maintenance','Access Control Installation','Intercom & Video Doorbell Setup','CCTV Upgrade & Expansion'],5),
('Samuel Ndayisaba','SN','Lighting Specialist',10,ARRAY['Kigali','Muhanga'],4.8,158,'+250 788 100 006','250788100006','Available Now','#F5C300',ARRAY['LED Lighting Installation','Chandelier & Pendant Fitting','Smart Lighting Setup & Programming','LED Strip & Cove Lighting','Outdoor & Garden Lighting','Floodlight Installation','Downlight & Panel Light Fitting','Lighting Control Systems','Energy-Saving Lighting Consultation','Lighting Design & Layout Planning'],6);