import { Button } from "@codegouvfr/react-dsfr/Button";

import { useMainMachineContext } from "../../../contexts/MainMachineContext/MainMachineContext";

type Color = "dark" | "light";

export interface BasicBackButtonProps {
  color?: Color;
  className?: string;
  onClick: () => void;
  label?: string;
}

export const BasicBackButton = ({
  className = "",
  color = "dark",
  onClick,
  label,
}: BasicBackButtonProps) => {
  const colorClass = color === "dark" ? "text-dsfrBlue-500" : "text-white";
  const hoverBgClass = color === "dark" ? "" : "hover:!bg-slate-800";

  return (
    <Button
      data-test="button-back"
      iconId="fr-icon-arrow-go-back-fill"
      onClick={onClick}
      priority="tertiary no outline"
      title="Revenir"
      className={`ml-10 min-w-[120px] ${className} ${colorClass} ${hoverBgClass}`}
    >
      {label}
    </Button>
  );
};

export const BackButton = (props: Omit<BasicBackButtonProps, "onClick">) => {
  const { mainService } = useMainMachineContext();
  return (
    <BasicBackButton {...props} onClick={() => mainService.send("BACK")} />
  );
};
