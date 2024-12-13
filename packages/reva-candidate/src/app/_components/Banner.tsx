import Image from "next/image";
import { ReactNode } from "react";

export const Banner = ({
  imageSrc,
  imgAlt,
  description,
}: {
  imageSrc: string;
  imgAlt: string;
  description: string | ReactNode;
}) => {
  return (
    <div className="static w-full border-b-[4px] border-b-[#FFA180] px-8 py-8 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] flex flex-col items-center text-start lg:relative lg:h-[85px] lg:flex-row">
      <Image
        src={imageSrc}
        width={132}
        height={153}
        alt={imgAlt}
        className="relative hidden -top-28 lg:block lg:top-0 lg:-left-9"
      />
      <div className="flex flex-col justify-center px-4 text-justify lg:mt-0 lg:p-0">
        <p className="my-0">{description}</p>
      </div>
    </div>
  );
};
