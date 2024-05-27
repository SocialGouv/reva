import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { CandidacySummary } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import Link from "next/link";

export const CandidacyCard = ({
  candidacy,
}: {
  candidacy: CandidacySummary;
}) => {
  return (
    <WhiteCard key={candidacy.id}>
      <h3 className="mb-2 text-lg">{candidacy.certification?.label}</h3>
      <div className="mb-2 flex gap-x-12 text-lg">
        <span>
          {candidacy.firstname} {candidacy.lastname}
        </span>
        <span>
          {candidacy.department?.label} ({candidacy.department?.code})
        </span>
      </div>

      {!!candidacy.sentAt && (
        <p className="mb-2 text-lg">
          Envoyée le {format(candidacy.sentAt as number, "dd MMMM yyyy")}
        </p>
      )}
      <div className="flex justify-between items-end">
        <p className="m-0 text-neutral-500">
          {candidacy.organism?.informationsCommerciales?.nom ??
            candidacy.organism?.label}
        </p>
        <Link href={`/candidacies/${candidacy.id}/summary`}>
          <Button>Accéder à la candidature</Button>
        </Link>
      </div>
    </WhiteCard>
  );
};
