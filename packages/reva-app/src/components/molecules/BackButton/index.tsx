import { Button } from "@codegouvfr/react-dsfr/Button";
type Color = "dark" | "light";

export interface BackButtonProps {
  color?: Color;
  className?: string;
  onClick: () => void;
  label?: string;
}

export const BackButton = ({
  className = "",
  color = "dark",
  onClick,
  label,
}: BackButtonProps) => {
  const colorClass = color === "dark" ? "text-dsfrBlue-500" : "text-white";
  const hoverBgClass = color === "dark" ? "" : "hover:!bg-slate-800";

  return (
    <Button
      data-test="button-back"
      iconId="fr-icon-arrow-go-back-fill"
      onClick={onClick}
      priority="tertiary no outline"
      title="Revenir"
      className={`ml-10 ${className} ${colorClass} ${hoverBgClass}`}
    >
      {label}
    </Button>
  );
};
