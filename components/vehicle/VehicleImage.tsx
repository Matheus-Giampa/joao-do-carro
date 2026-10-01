import Image, { type ImageProps } from "next/image";

/** next/image com tratamento para SVGs de demonstração (servidos sem otimização). */
export function VehicleImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const isSvg = src.endsWith(".svg");
  return <Image src={src} alt={alt} unoptimized={isSvg} {...props} />;
}
