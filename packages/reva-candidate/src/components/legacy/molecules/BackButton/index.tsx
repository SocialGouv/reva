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
  props: Omit<BasicBackButtonProps, "children"> & { label: string, href?: string },
) => {
  return (
    <BasicBackButton className="p-0 pl-4" {...props}>
      <Link href={props.href ?? "/"} className="w-full h-full block px-4 py-2 pl-0">{props.label}</Link>
    </BasicBackButton>
  );
};
