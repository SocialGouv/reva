import Image from "next/image";

import hexagonBackground from "./hexagonBackground.svg";

export const EmptyState = ({
  title,
  "data-testid": dataTest,
  pictogram,
  orientation,
  children = "vertical",
}: {
  title: string;
  "data-testid": string;
  pictogram: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}) => {
  if (orientation === "horizontal") {
    return (
      <div data-testid={dataTest} className="lg:flex pt-20 pb-20 px-6 lg:px-16">
        <div className="flex-1 py-10">
          <h1>{title}</h1>
          <div>{children}</div>
        </div>
        <div className="relative flex items-center justify-center w-[282px] h-[319px]">
          <Image src={hexagonBackground} className="absolute inset-0" alt="" />
          <div className="z-10">{pictogram}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={dataTest}
      className="min-h-80 h-full flex flex-col items-center"
    >
      <div className="my-6 relative flex items-center justify-center w-[208px] h-[234px]">
        <Image src={hexagonBackground} className="absolute inset-0" alt="" />
        <div className="z-10">{pictogram}</div>
      </div>
      <h3 className="text-center text-balance">{title}</h3>
      <div className="max-w-lg [&_p]:text-lg text-center text-balance leading-relaxed">
        {children}
      </div>
    </div>
  );
};
