import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export const BadgeCompleted = () => <Badge severity="success">Complété</Badge>;

export const BadgeToComplete = () => (
  <Badge severity="warning">À compléter</Badge>
);

export type CandidacySectionCardStatus = "TO_COMPLETE" | "COMPLETED";

export const DefaultCandidacySectionCard = ({
  title,
  titleIconClass,
  status,
  buttonOnClickHref,
  children,
}: {
  title: string;
  titleIconClass?: string;
  status: "TO_COMPLETE" | "COMPLETED";
  buttonOnClickHref: string;
  children?: ReactNode;
}) => {
  const router = useRouter();
  return (
    <CandidacySectionCard
      title={title}
      titleIconClass={titleIconClass}
      badge={status == "TO_COMPLETE" ? <BadgeToComplete /> : <BadgeCompleted />}
      hasButton={true}
      buttonPriority={status === "TO_COMPLETE" ? "primary" : "secondary"}
      buttonTitle={status === "TO_COMPLETE" ? "Compléter" : "Modifier"}
      buttonOnClick={() => router.push(buttonOnClickHref)}
    >
      {children}
    </CandidacySectionCard>
  );
};
