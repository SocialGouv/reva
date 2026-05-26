import Card from "@codegouvfr/react-dsfr/Card";
import Image from "next/image";

import { useAuth } from "@/components/auth/auth";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

export const CertificationCard = ({
  candidacy,
  disableUpdateCertification = false,
}: {
  candidacy: {
    id: string;
    status: CandidacyStatusStep;
    certification?: {
      id: string;
      codeRncp: string;
      label: string;
    } | null;
    candidacyDropOut?: unknown;
  };
  disableUpdateCertification?: boolean;
}) => {
  const { isAdmin, isGestionnaireMaisonMereAAP, isOrganism } = useAuth();

  const certification = candidacy.certification;
  const candidacyActiveStatus = candidacy.status;

  if (!certification) {
    return null;
  }
  // Bloquer le changement de certification si DF incomplet (sauf pour l'admin)
  const isDfIncomplete =
    candidacyActiveStatus === "DOSSIER_FAISABILITE_INCOMPLET";
  const shouldBlockForNonAdmin = isDfIncomplete && !isAdmin;

  const canUpdateCertification =
    (isAdmin || isGestionnaireMaisonMereAAP || isOrganism) &&
    candidacyActiveStatus &&
    [
      "PROJET",
      "VALIDATION",
      "PRISE_EN_CHARGE",
      "PARCOURS_ENVOYE",
      "PARCOURS_CONFIRME",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ].includes(candidacyActiveStatus) &&
    !candidacy.candidacyDropOut &&
    !shouldBlockForNonAdmin &&
    !disableUpdateCertification;

  return (
    <Card
      title={certification.label}
      detail={
        <div className="flex items-center gap-2 mb-3">
          <Image
            src="/admin2/components/verified-badge.svg"
            alt="Verified badge icon"
            width={16}
            height={16}
          />
          RNCP {certification.codeRncp}
        </div>
      }
      endDetail={
        canUpdateCertification ? (
          <span>
            Pour changer de certification, consultez la fiche détaillée de cette
            certification
          </span>
        ) : (
          <span>Consulter la fiche détaillée de cette certification</span>
        )
      }
      linkProps={{
        href: `/certification-details/${certification.id}${canUpdateCertification ? `?candidacyId=${candidacy.id}` : ""}`,
      }}
      enlargeLink
    />
  );
};
