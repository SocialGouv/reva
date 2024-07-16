import Link from "next/link";
import { Button } from "@codegouvfr/react-dsfr/Button";

type Color = "dark" | "light";

export interface BasicBackButtonProps {
  color?: Color;
  className?: string;
  children?: React.ReactNode;
}

export const BasicBackButton = ({
  className = "",
  color = "dark",
  children,
}: BasicBackButtonProps) => {
  const colorClass = color === "dark" ? "text-dsfrBlue-500" : "text-white";
  const hoverBgClass = color === "dark" ? "" : "hover:!bg-slate-800";

  return (
    <Button
      data-test="button-back"
      iconId="fr-icon-arrow-go-back-fill"
      priority="tertiary"
      title="Revenir"
      className={`${className} ${colorClass} ${hoverBgClass}`}
    >
      {children}
    </Button>
  );
};

export const BackButton = (
  props: Omit<BasicBackButtonProps, "children"> & { label: string },
) => {
  return (
    <BasicBackButton {...props}>
      <Link href="/">{props.label}</Link>
    </BasicBackButton>
  );
};
