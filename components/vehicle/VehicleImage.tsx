import Image, { type ImageProps } from "next/image";
import { asset } from "@/lib/paths";

/** next/image com tratamento para SVGs de demonstração (servidos sem otimização). */
export function VehicleImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const isSvg = src.endsWith(".svg");
  return <Image src={asset(src)} alt={alt} unoptimized={isSvg} {...props} />;
}
