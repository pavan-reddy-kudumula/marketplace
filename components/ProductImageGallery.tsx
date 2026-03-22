"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-gray-100 text-5xl">
        📦
      </div>
    );
  }

  return (
    <div>
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {validImages.map((image, index) => (
            <CarouselItem key={`${image}-${index}`}>
              <div className="flex h-96 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 md:h-[600px]">
                <img
                  src={image}
                  alt={`${productName} image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {validImages.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>
    </div>
  );
}