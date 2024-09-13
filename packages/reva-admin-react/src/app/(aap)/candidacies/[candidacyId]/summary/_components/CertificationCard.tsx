import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { CandidacyStatusStep } from "@/graphql/generated/graphql";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useAuth } from "@/components/auth/auth";

export const CertificationCard = ({
  candidacy,
}: {
  candidacy: {
    id: string;
    status: CandidacyStatusStep;
    certification?: { codeRncp: string; label: string } | null;
    candidacyDropOut?: unknown;
  };
}) => {
  const { isAdmin, isGestionnaireMaisonMereAAP, isOrganism } = useAuth();
  const certification = candidacy.certification;
  const candidacyActiveStatus = candidacy.status;
  const canUpdateCertification =
    (isAdmin || isGestionnaireMaisonMereAAP || isOrganism) &&
    candidacyActiveStatus &&
    [
      "PRISE_EN_CHARGE",
      "PARCOURS_ENVOYE",
      "PARCOURS_CONFIRME",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ].includes(candidacyActiveStatus) &&
    !candidacy.candidacyDropOut;

  return (
    <GrayCard>
      <h4 className="flex items-center justify-between">
        La certification choisie
        {canUpdateCertification && (
          <Button
            priority="secondary"
            linkProps={{
              target: "_self",
              href: `/candidacies/${candidacy.id}/reorientation`,
            }}
          >
            Changer la certification
          </Button>
        )}
      </h4>
      {certification ? (
        <>
          <p className="mb-2 text-xl font-semibold text-gray-900">
            {certification.label}
          </p>
          <p className="text-xs text-gray-600 mb-0">
            RNCP {certification.codeRncp}
          </p>
        </>
      ) : (
        <p className="mb-0">Aucune certification</p>
      )}
    </GrayCard>
  );
};
