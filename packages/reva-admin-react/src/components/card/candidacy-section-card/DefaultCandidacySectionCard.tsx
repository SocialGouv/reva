import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export const BadgeCompleted = () => (
  <Badge data-test="completed-badge" severity="success">
    Complété
  </Badge>
);

export const BadgeToComplete = () => (
  <Badge data-test="to-complete-badge" severity="warning">
    À compléter
  </Badge>
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
  "data-test": dataTest,
}: {
  title: string;
  titleIconClass?: string;
  status: "TO_COMPLETE" | "COMPLETED";
  isEditable?: boolean;
  disabled?: boolean;
  buttonOnClickHref?: string;
  children?: ReactNode;
  CustomBadge?: ReactNode;
  "data-test"?: string;
}) => {
  const router = useRouter();

  const badge =
    CustomBadge ||
    (status === "TO_COMPLETE" ? <BadgeToComplete /> : <BadgeCompleted />);

  if (isEditable && buttonOnClickHref) {
    return (
      <CandidacySectionCard
        data-test={dataTest}
        title={title}
        titleIconClass={titleIconClass}
        badge={badge}
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

  if (isEditable) {
    return (
      <CandidacySectionCard
        data-test={dataTest}
        title={title}
        titleIconClass={titleIconClass}
        badge={badge}
        disabled={disabled}
      >
        {children}
      </CandidacySectionCard>
    );
  }

  return (
    <CandidacySectionCard
      data-test={dataTest}
      title={title}
      titleIconClass={titleIconClass}
      hasButton={false}
      disabled={disabled}
    >
      {children}
    </CandidacySectionCard>
  );
};
