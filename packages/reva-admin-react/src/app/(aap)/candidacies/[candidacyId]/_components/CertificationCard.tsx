import Card from "@codegouvfr/react-dsfr/Card";
import Image from "next/image";

import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

export const CertificationCard = ({
  candidacy,
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
}) => {
  const { isAdmin, isGestionnaireMaisonMereAAP, isOrganism } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const isMultiCandidacyFeatureActive = isFeatureActive("MULTI_CANDIDACY");
  const certification = candidacy.certification;
  const candidacyActiveStatus = candidacy.status;

  if (!certification) {
    return null;
  }

  // Bloquer le changement de certification si DF incomplet et MULTI_CANDIDACY actif (sauf pour l'admin)
  const isDfIncomplete =
    candidacyActiveStatus === "DOSSIER_FAISABILITE_INCOMPLET";
  const shouldBlockForNonAdmin =
    isMultiCandidacyFeatureActive && isDfIncomplete && !isAdmin;

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
    !shouldBlockForNonAdmin;

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
        canUpdateCertification && (
          <span>
            Pour changer de certification, consultez la fiche détaillée de cette
            certification
          </span>
        )
      }
      linkProps={{
        href: `/certification-details/${certification.id}?candidacyId=${candidacy.id}`,
      }}
      enlargeLink
    />
  );
};
