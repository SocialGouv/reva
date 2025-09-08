import { Button } from "@codegouvfr/react-dsfr/Button";
import { ReactNode } from "react";

export const BackButton = ({
  href,
  children,
  hasIcon = true,
}: {
  href: string;
  children: ReactNode;
  hasIcon?: boolean;
}) => {
  const buttonProps = {
    priority: "tertiary" as const,
    className: "mb-6",
    linkProps: {
      href,
      target: "_self" as const,
    },
  };

  return hasIcon ? (
    <Button {...buttonProps} iconId="fr-icon-arrow-go-back-line">
      {children}
    </Button>
  ) : (
    <Button {...buttonProps}>{children}</Button>
  );
};
