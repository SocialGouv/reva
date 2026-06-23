import { Button, ButtonProps } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import hexagonBackground from "./assets/hexagonBackground.svg";

export const StatusPage = ({
  title,
  chapo,
  details,
  pictogram,
  actionLink,
}: {
  title: string;
  chapo: React.ReactNode;
  details?: React.ReactNode;
  pictogram: React.ReactNode;
  actionLink?: {
    href: string;
    label: string;
    priority?: ButtonProps["priority"];
  };
}) => (
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-col gap-10 flex-1">
      <div className="flex flex-col gap-6">
        <h1 className="mb-0">{title}</h1>
        <p className="fr-text--lead mb-0 max-w-[800px] text-dsfrGray-700">
          {chapo}
        </p>
        {details && (
          <div className="text-sm max-w-[800px] text-dsfrGray-700">
            {details}
          </div>
        )}
      </div>
      {actionLink && (
        <Button
          priority={actionLink.priority ?? "secondary"}
          linkProps={{ href: actionLink.href }}
          className="w-full justify-center lg:w-auto lg:self-start"
        >
          {actionLink.label}
        </Button>
      )}
    </div>
    <div className="shrink-0 hidden lg:flex relative items-center justify-center w-[282px] h-[319px]">
      <Image
        src={hexagonBackground}
        className="absolute inset-0"
        alt=""
        loading="eager"
      />
      <div className="z-10">{pictogram}</div>
    </div>
  </div>
);
