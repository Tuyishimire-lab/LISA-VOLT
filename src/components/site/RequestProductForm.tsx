import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  submitProductRequest,
  PRODUCT_REQUEST_CATEGORIES,
  PRODUCT_REQUEST_BUDGETS,
} from "@/lib/product-requests.functions";
import { X, Upload, Link as LinkIcon, CheckCircle2 } from "lucide-react";

const MAX_IMAGES = 3;
const MAX_BYTES = 2 * 1024 * 1024; // 2MB each

type ImageItem = {
  file: File;
  preview: string;
  dataBase64: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.includes(",") ? res.split(",")[1] : res;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function RequestProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const submit = useServerFn(submitProductRequest);
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [product_name, setProductName] = useState("");
  const [category, setCategory] = useState<(typeof PRODUCT_REQUEST_CATEGORIES)[number]>("Lighting");
  const [budget_range, setBudget] = useState<string>("");
  const [product_link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const next: ImageItem[] = [...images];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_IMAGES) break;
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 2MB.`);
        continue;
      }
      const dataBase64 = await fileToBase64(file);
      next.push({ file, preview: URL.createObjectURL(file), dataBase64 });
    }
    setImages(next);
  }

  function removeImage(i: number) {
    setImages((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submit({
        data: {
          full_name: full_name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          product_name: product_name.trim(),
          category,
          budget_range: budget_range as never,
          product_link: product_link.trim(),
          notes: notes.trim(),
          images: images.map((i) => ({
            name: i.file.name,
            contentType: i.file.type || "image/jpeg",
            dataBase64: i.dataBase64,
          })),
        },
      });
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="mt-3 text-xl font-bold text-navy">Thank you!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We've received your request. Our team will contact you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setFullName("");
            setPhone("");
            setEmail("");
            setProductName("");
            setBudget("");
            setLink("");
            setNotes("");
            setImages([]);
          }}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-yellow px-4 py-2 text-sm font-semibold text-navy hover:bg-yellow-dark"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Full Name *</label>
          <input
            required
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={120}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Phone (WhatsApp) *</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+250 78..."
            maxLength={40}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">Email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Product Name or Description *
        </label>
        <textarea
          required
          value={product_name}
          onChange={(e) => setProductName(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Describe what you're looking for…"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as never)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {PRODUCT_REQUEST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Budget (RWF, optional)</label>
          <select
            value={budget_range}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Any budget</option>
            {PRODUCT_REQUEST_BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Product Image (up to {MAX_IMAGES}, max 2MB each)
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative h-20 w-20 rounded-md overflow-hidden border border-border">
              <img src={img.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-navy hover:text-navy">
              <Upload className="h-5 w-5" />
              <span className="mt-1 text-[10px]">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Product Link (Alibaba, Amazon, Jumia, etc.)
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={product_link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            maxLength={2000}
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
        {product_link && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{product_link}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={4000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-yellow px-4 py-3 text-sm font-bold text-navy hover:bg-yellow-dark transition-colors disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send My Request"}
      </button>
    </form>
  );
}
