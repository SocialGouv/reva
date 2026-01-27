import Image from "next/image";

import hexagonBackground from "./assets/hexagonBackground.svg";

export const StatusPage = ({
  title,
  description,
  pictogram,
  content,
  buttons,
}: {
  title: string;
  description: React.ReactNode;
  pictogram: React.ReactNode;
  content?: React.ReactNode;
  buttons?: React.ReactNode;
}) => (
  <div className="w-full px-6 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-col gap-8">
      <div>
        <h1>{title}</h1>
        <p className="mb-0">{description}</p>
      </div>
      {content}
      {buttons && <div>{buttons}</div>}
    </div>
    <div className="shrink-0 hidden lg:flex relative items-center justify-center w-[208px] h-[234px]">
      <Image src={hexagonBackground} className="absolute inset-0" alt="" />
      <div className="z-10">{pictogram}</div>
    </div>
  </div>
);
