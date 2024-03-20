import { ReactNode } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const BackButton = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Button
    priority="tertiary"
    iconId="fr-icon-arrow-go-back-line"
    linkProps={{
      href,
      target: "_self",
    }}
  >
    {children}
  </Button>
);
