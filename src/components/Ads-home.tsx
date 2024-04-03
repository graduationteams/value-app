import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

export default function EmblaCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true });

  return (
    <div className="min-h-32 overflow-x-hidden pt-4" ref={emblaRef}>
      <div className="flex">
        <div className=" w-full min-w-0 flex-shrink-0 flex-grow-0 basis-full overflow-x-hidden">
          <Image
            src="/images/Ad.png"
            alt="slide 1"
            width={519}
            height={119}
            className="mx-auto"
          />
        </div>
        <div className=" w-full min-w-0 flex-shrink-0 flex-grow-0 basis-full overflow-x-hidden">
          <Image
            src="/images/Ad.png"
            alt="slide 1"
            width={519}
            height={119}
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
