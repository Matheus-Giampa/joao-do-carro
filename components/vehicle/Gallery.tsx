"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import { VehicleImage } from "./VehicleImage";
import { cn } from "@/lib/utils";
import type { VehicleImage as VImage } from "@/types";

export function Gallery({ images, alt, sold = false, children }: { images: VImage[]; alt: string; sold?: boolean; children?: React.ReactNode }) {
  const list = images.length ? images : [{ id: "ph", url: "/placeholder-car.svg", position: 0, vehicle_id: "", storage_path: null }];
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touchX = useRef<number | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: number) => {
      setZoom(false);
      setIndex((i) => (i + dir + list.length) % list.length);
    },
    [list.length],
  );

  useEffect(() => {
    const el = thumbs.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current == null || zoom) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  const current = list[index];

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-900 sm:aspect-[16/10]" {...swipe}>
        <button type="button" className="absolute inset-0 cursor-zoom-in" onClick={() => setLightbox(true)} aria-label="Ampliar foto">
          <VehicleImage
            key={current.id}
            src={current.url}
            alt={`${alt} — foto ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={cn("animate-fade-up object-cover", sold && "grayscale-[60%]")}
          />
        </button>
        {children}
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-950 shadow-lg transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100" aria-label="Foto anterior">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-950 shadow-lg transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100" aria-label="Próxima foto">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2">
          <span className="rounded-full bg-ink-950/75 px-3 py-1 text-xs font-semibold text-white">
            {index + 1} / {list.length}
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-950/75 text-white">
            <Expand className="h-4 w-4" />
          </span>
        </div>
      </div>

      {list.length > 1 && (
        <div ref={thumbs} className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 transition sm:w-24",
                i === index ? "ring-brand-600" : "opacity-70 ring-transparent hover:opacity-100",
              )}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
            >
              <VehicleImage src={img.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Galeria de fotos">
          <div className="flex items-center justify-between p-3 text-white sm:p-4">
            <span className="text-sm font-semibold">
              {index + 1} / {list.length}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setZoom((z) => !z)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label={zoom ? "Diminuir zoom" : "Aumentar zoom"}>
                {zoom ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </button>
              <button type="button" onClick={() => { setLightbox(false); setZoom(false); }} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Fechar galeria">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            className={cn("relative flex-1 overflow-hidden", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
            {...swipe}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
              setZoom((z) => !z);
            }}
            onMouseMove={(e) => {
              if (!zoom) return;
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            <div className="absolute inset-0 transition-transform duration-300" style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}>
              <VehicleImage src={current.url} alt={`${alt} — foto ${index + 1}`} fill sizes="100vw" className="object-contain" quality={90} />
            </div>
          </div>
          {list.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6" aria-label="Foto anterior">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6" aria-label="Próxima foto">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-3">
            {list.map((img, i) => (
              <button key={img.id} type="button" onClick={() => { setIndex(i); setZoom(false); }} className={cn("relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md", i === index ? "ring-2 ring-brand-500" : "opacity-50 hover:opacity-100")} aria-label={`Ver foto ${i + 1}`}>
                <VehicleImage src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
