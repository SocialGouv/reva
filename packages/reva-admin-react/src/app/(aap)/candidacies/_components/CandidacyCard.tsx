import { useRouter } from "next/navigation";
import { format } from "date-fns";

import Tag from "@codegouvfr/react-dsfr/Tag";

import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { OrganismModaliteAccompagnement } from "@/graphql/generated/graphql";

export const CandidacyCard = ({
  candidacyId,
  candidateFirstname,
  candidateLastname,
  certificationLabel,
  departmentLabel,
  departmentCode,
  organismLabel,
  organismModalitateAccompagnement,
  candidacySentAt,
  fundable,
  vaeCollective,
  vaeCollectiveCommanditaireLabel,
  vaeCollectiveProjetLabel,
  vaeCollectiveCohortLabel,
}: {
  candidacyId: string;
  candidateFirstname?: string;
  candidateLastname?: string;
  certificationLabel?: string;
  departmentLabel?: string;
  departmentCode?: string;
  organismLabel?: string;
  organismModalitateAccompagnement?: OrganismModaliteAccompagnement;
  candidacySentAt?: Date;
  fundable: boolean;
  vaeCollective?: boolean;
  vaeCollectiveCommanditaireLabel?: string;
  vaeCollectiveProjetLabel?: string;
  vaeCollectiveCohortLabel?: string;
}) => {
  const router = useRouter();

  return (
    <WhiteCard
      key={candidacyId}
      className="gap-3 fr-card--shadow hover:bg-dsfr-light-neutral-grey-1000 cursor-pointer"
      onClick={() => {
        router.push(`/candidacies/${candidacyId}/summary`);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          {organismModalitateAccompagnement == "A_DISTANCE" && (
            <Tag small iconId="fr-icon-headphone-fill">
              À distance
            </Tag>
          )}
          {organismModalitateAccompagnement == "LIEU_ACCUEIL" && (
            <Tag small iconId="fr-icon-home-4-fill">
              Sur site
            </Tag>
          )}
          <Tag small>
            {fundable ? "Finançable France VAE" : "Financement droit commun"}
          </Tag>
          {vaeCollective && <Tag small>VAE collective</Tag>}
        </div>

        {departmentLabel && departmentCode && (
          <div className="text-xs text-dsfrGray-mentionGrey">{`${departmentLabel} (${departmentCode})`}</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-bold text-xl text-dsfr-blue-france-sun-113">
          {candidateFirstname} {candidateLastname}
        </div>

        <p className="m-0 text-sm">
          {certificationLabel && (
            <span>
              {certificationLabel}
              <br />
            </span>
          )}

          {organismLabel && (
            <span>
              {organismLabel}
              <br />
            </span>
          )}

          {vaeCollectiveCommanditaireLabel && vaeCollectiveProjetLabel && (
            <span>
              {`${vaeCollectiveCommanditaireLabel} - ${vaeCollectiveProjetLabel}`}
              <br />
            </span>
          )}

          {vaeCollectiveCohortLabel && <span>{vaeCollectiveCohortLabel}</span>}
        </p>
      </div>

      <div className="flex flex-row gap-2 justify-between">
        <div className="text-xs text-dsfrGray-mentionGrey">
          {!!candidacySentAt &&
            `Envoyée le ${format(candidacySentAt, "dd MMMM yyyy")}`}
        </div>

        <span
          className="fr-icon--sm fr-icon-arrow-right-line text-dsfr-blue-france-sun-113"
          aria-hidden="true"
        ></span>
      </div>
    </WhiteCard>
  );
};
