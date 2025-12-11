import Image from "next/image";

import hexagonBackground from "./assets/hexagonBackground.svg";

export const WelcomePage = ({
  title,
  description,
  pictogram,
  content,
  buttons,
}: {
  title: string;
  description: string;
  pictogram: React.ReactNode;
  content?: React.ReactNode;
  buttons?: React.ReactNode;
}) => (
  <div
    className="w-full px-6 my-10 flex justify-between "
    data-testid="candidacy-dropout-confirmation-page"
  >
    <div className="flex flex-col">
      <h1 className="text-dsfrGray-800">{title}</h1>
      <p className="text-xl">{description}</p>
      {content}
      {buttons}
    </div>
    <div className="my-auto h-my-6 relative flex items-center justify-center w-[208px] h-[234px]">
      <Image src={hexagonBackground} className="absolute inset-0" alt="" />
      <div className="z-10">{pictogram}</div>
    </div>
  </div>
);
