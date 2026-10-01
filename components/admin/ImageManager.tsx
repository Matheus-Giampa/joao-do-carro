"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ManagedImage = { key: string; url: string; storage_path: string | null; uploading?: boolean; error?: string };

/** Redimensiona e converte para WebP no navegador (fotos mais leves = site mais rápido). */
export async function optimizeImage(file: File, max = 1920, quality = 0.82): Promise<{ blob: Blob; ext: string; type: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
    if (blob) return { blob, ext: "webp", type: "image/webp" };
  } catch {
    /* formato não suportado pelo canvas: envia original */
  }
  return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "jpg", type: file.type || "image/jpeg" };
}

export async function uploadToStorage(file: File, folder: string) {
  const supabase = createSupabaseBrowserClient();
  const { blob, ext, type } = await optimizeImage(file);
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, storage_path: path };
}

/**
 * Gerenciador de fotos: upload múltiplo (arrastar e soltar), definir capa,
 * reorganizar (arrastar ou setas) e remover. A 1ª foto é a capa.
 */
export function ImageManager({ images, onChange }: { images: ManagedImage[]; onChange: (fn: (prev: ManagedImage[]) => ManagedImage[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 30);
    const placeholders = list.map((f) => ({ key: crypto.randomUUID(), url: URL.createObjectURL(f), storage_path: null, uploading: true }));
    onChange((prev) => [...prev, ...placeholders]);
    await Promise.all(
      list.map(async (file, i) => {
        const key = placeholders[i].key;
        try {
          const uploaded = await uploadToStorage(file, "vehicles");
          onChange((prev) => prev.map((img) => (img.key === key ? { key, ...uploaded } : img)));
        } catch (e) {
          onChange((prev) => prev.map((img) => (img.key === key ? { ...img, uploading: false, error: e instanceof Error ? e.message : "Falha no envio" } : img)));
        }
      }),
    );
  }

  const move = (from: number, to: number) =>
    onChange((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
          dragOver ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-ink-50 hover:border-ink-400",
        )}
      >
        <UploadCloud className="h-9 w-9 text-ink-400" />
        <p className="mt-2 font-semibold text-ink-800">Clique ou arraste as fotos aqui</p>
        <p className="text-xs text-ink-500">JPG, PNG ou WebP · várias de uma vez · otimizadas automaticamente</p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs text-ink-500">Arraste para reorganizar. A primeira foto é a <strong>capa</strong> do anúncio.</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img, i) => (
              <li
                key={img.key}
                draggable={!img.uploading}
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && dragIndex !== i) move(dragIndex, i);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-2 bg-white",
                  i === 0 ? "border-brand-600" : "border-transparent",
                  dragIndex === i && "opacity-40",
                  !img.uploading && "cursor-grab active:cursor-grabbing",
                )}
              >
                <div className="relative aspect-[4/3] bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 grid place-items-center bg-white/70">
                      <Loader2 className="h-6 w-6 animate-spin text-ink-700" />
                    </div>
                  )}
                  {img.error && <div className="absolute inset-0 grid place-items-center bg-brand-700/85 p-2 text-center text-xs font-semibold text-white">{img.error}</div>}
                  {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Capa</span>}
                  <span className="absolute right-2 top-2 rounded-md bg-ink-950/70 px-1.5 py-0.5 text-[10px] font-bold text-white">{i + 1}</span>
                </div>
                <div className="flex items-center justify-between gap-1 p-1.5">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 disabled:opacity-30" aria-label="Mover para a esquerda"><ArrowLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 disabled:opacity-30" aria-label="Mover para a direita"><ArrowRight className="h-4 w-4" /></button>
                  </div>
                  <div className="flex gap-1">
                    {i !== 0 && (
                      <button type="button" onClick={() => move(i, 0)} title="Definir como capa" className="grid h-8 w-8 place-items-center rounded-lg text-amber-500 hover:bg-amber-50" aria-label="Definir como capa"><Star className="h-4 w-4" /></button>
                    )}
                    <button type="button" onClick={() => onChange((prev) => prev.filter((p) => p.key !== img.key))} className="grid h-8 w-8 place-items-center rounded-lg text-brand-700 hover:bg-brand-50" aria-label="Remover foto"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => input.current?.click()} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-ink-500 hover:border-ink-400">
                <ImagePlus className="h-6 w-6" /> <span className="text-xs font-semibold">Adicionar</span>
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
