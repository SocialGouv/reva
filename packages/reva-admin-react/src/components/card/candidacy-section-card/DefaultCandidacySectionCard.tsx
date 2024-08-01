import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export const BadgeCompleted = () => <Badge severity="success">Complété</Badge>;

export const BadgeToComplete = () => (
  <Badge severity="warning">À compléter</Badge>
);

export const DefaultCandidacySectionCard = ({
  title,
  titleIconClass,
  status,
  isEditable = false,
  disabled = false,
  buttonOnClickHref,
  children,
  CustomBadge,
}: {
  title: string;
  titleIconClass?: string;
  status: "TO_COMPLETE" | "COMPLETED";
  isEditable?: boolean;
  disabled?: boolean;
  buttonOnClickHref: string;
  children?: ReactNode;
  CustomBadge?: ReactNode;
}) => {
  const router = useRouter();

  if (isEditable) {
    return (
      <CandidacySectionCard
        title={title}
        titleIconClass={titleIconClass}
        badge={
          CustomBadge ||
          (status === "TO_COMPLETE" ? <BadgeToComplete /> : <BadgeCompleted />)
        }
        disabled={disabled}
        hasButton
        buttonPriority={status === "TO_COMPLETE" ? "primary" : "secondary"}
        buttonTitle={status === "TO_COMPLETE" ? "Compléter" : "Modifier"}
        buttonOnClick={() => router.push(buttonOnClickHref)}
      >
        {children}
      </CandidacySectionCard>
    );
  }

  return (
    <CandidacySectionCard
      title={title}
      titleIconClass={titleIconClass}
      hasButton={false}
      disabled={disabled}
    >
      {children}
    </CandidacySectionCard>
  );
};
