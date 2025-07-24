import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Image from "next/image";

import { useAuth } from "@/components/auth/auth";

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
      isAapAvailable: boolean;
    } | null;
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
    <Card
      start={
        <Tag small className="mb-3">
          {certification?.isAapAvailable
            ? "VAE en autonomie ou accompagnée"
            : "VAE en autonomie"}
        </Tag>
      }
      title={certification?.label}
      detail={
        <div className="flex items-center gap-2 mb-3">
          <Image
            src="/admin2/icons/verified-badge.svg"
            alt="Verified badge icon"
            width={16}
            height={16}
          />
          RNCP {certification?.codeRncp}
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
        href: `/certification-details/${certification?.id}?candidacyId=${candidacy.id}`,
      }}
      enlargeLink
    />
  );
};
