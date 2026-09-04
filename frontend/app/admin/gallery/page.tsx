"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload, Loader2 } from "lucide-react";
import { api, fileUrl, ApiRequestError } from "@/lib/api";

const CATEGORIES = ["classroom", "lab", "events", "workshops", "activities", "certificates", "competitions"];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("classroom");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const data = await api.get<{ images: any[] }>("/api/gallery");
    setImages(data.images);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", category);
      formData.append("caption", caption);
      await api.post("/api/gallery", formData);
      setFile(null);
      setCaption("");
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    await api.delete(`/api/gallery/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Gallery</h1>
      <p className="text-sm text-slate mt-1">Upload and manage gallery photos</p>

      <form onSubmit={handleUpload} className="mt-6 bg-white border border-blueprint/10 p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block border border-blueprint/20 px-3 py-2.5 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate">Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-1 block border border-blueprint/20 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate">Image</label>
          <input
            required
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !file}
          className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {loading && <p className="text-sm text-slate col-span-full">Loading…</p>}
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square bg-paper-dim border border-blueprint/10 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fileUrl(img.image_url) || ""} alt={img.caption || ""} className="w-full h-full object-cover" />
            <button
              onClick={() => remove(img.id)}
              className="absolute top-1.5 right-1.5 bg-white/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} className="text-red-600" />
            </button>
            <span className="absolute bottom-0 inset-x-0 bg-ink/70 text-white text-[10px] font-mono px-1.5 py-1 truncate">
              {img.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
