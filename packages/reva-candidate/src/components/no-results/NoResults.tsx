import { PICTOGRAMS } from "@/components/pictograms/Pictograms";
import hexagonBackground from "./hexagonBackground.svg";
import Image from "next/image";

export const NoResults = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-80 h-full flex flex-col items-center">
      <div className="my-6 relative flex items-center justify-center w-[208px] h-[234px]">
        <Image src={hexagonBackground} className="absolute inset-0" alt="" />
        <div className="z-10">{PICTOGRAMS.searchLG}</div>
      </div>
      <h3 className="text-center text-balance">{title}</h3>
      <div className="max-w-lg [&_p]:text-lg text-center text-balance leading-relaxed">
        {children}
      </div>
    </div>
  );
};
