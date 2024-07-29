import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import Link from "next/link";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

export const CandidacyCard = ({
  candidacyId,
  certificationLabel,
  candidateFirstname,
  candidateLastname,
  candidacySentAt,
  departmentLabel,
  departmentCode,
  organismLabel,
  fundable,
}: {
  candidacyId: string;
  candidateFirstname?: string;
  candidateLastname?: string;
  certificationLabel?: string;
  candidacySentAt?: Date;
  departmentLabel?: string;
  departmentCode?: string;
  organismLabel?: string;
  fundable: boolean;
}) => {
  const { isFeatureActive } = useFeatureflipping();

  return (
    <WhiteCard key={candidacyId}>
      <div className="flex flex-col gap-2">
        {isFeatureActive("AFFICHAGE_TYPES_FINANCEMENT_CANDIDATURE") && (
          <Badge severity={fundable ? "info" : "new"} className="ml-auto">
            {fundable ? "finançable france vae" : "finançable droit commun"}
          </Badge>
        )}
        <h3 className="mb-2 text-lg">{certificationLabel}</h3>
      </div>
      <div className="mb-2 flex gap-x-12 text-lg">
        <span>
          {candidateFirstname} {candidateLastname}
        </span>
        <span>
          {departmentLabel} ({departmentCode})
        </span>
      </div>

      {!!candidacySentAt && (
        <p className="mb-2 text-lg">
          Envoyée le {format(candidacySentAt, "dd MMMM yyyy")}
        </p>
      )}
      <div className="flex justify-between items-end">
        <p className="m-0 text-neutral-500">{organismLabel}</p>
        <Link href={`/candidacies/${candidacyId}/summary`}>
          <Button>Accéder à la candidature</Button>
        </Link>
      </div>
    </WhiteCard>
  );
};
