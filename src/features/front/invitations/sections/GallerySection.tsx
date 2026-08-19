import Gallery from "@/features/front/components/siena/gallery";
import "photoswipe/dist/photoswipe.css";
import type { GallerySectionProps } from "../shared/types";

/** Sección: Galería de fotos con PhotoSwipe. */
export default function GallerySection(props: GallerySectionProps) {
  return <Gallery {...props} />;
}
