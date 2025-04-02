import hexagonBackground from "./hexagonBackground.svg";
import Image from "next/image";

export const EmptyState = ({
  title,
  "data-test": dataTest,
  pictogram,
  orientation,
  children = "vertical",
}: {
  title: string;
  "data-test": string;
  pictogram: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}) => {
  if (orientation === "horizontal") {
    return (
      <div data-test={dataTest} className="flex pt-6 pb-4 px-16">
        <div className="flex-1 py-6">
          <h1>{title}</h1>
          <div className="mb-10">{children}</div>
        </div>
        <div className="my-6 relative flex items-center justify-center w-[282px] h-[319px]">
          <Image src={hexagonBackground} className="absolute inset-0" alt="" />
          <div className="z-10">{pictogram}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-test={dataTest}
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
