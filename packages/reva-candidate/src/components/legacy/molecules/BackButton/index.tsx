import { Button } from "@codegouvfr/react-dsfr/Button";
import { useParams, useRouter } from "next/navigation";

type Color = "dark" | "light";

export interface BasicBackButtonProps {
  color?: Color;
  className?: string;
  onClick: () => void;
  label?: string;
}

const BasicBackButton = ({
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
      onClick={onClick}
      priority="tertiary"
      title="Revenir"
      className={`${className} ${colorClass} ${hoverBgClass}`}
    >
      {label}
    </Button>
  );
};

export const BackButton = (props: Omit<BasicBackButtonProps, "onClick">) => {
  const router = useRouter();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  return (
    <BasicBackButton
      {...props}
      onClick={() => router.push(`/${candidacyId}`)}
    />
  );
};
