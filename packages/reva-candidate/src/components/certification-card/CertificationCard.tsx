import Card from "@codegouvfr/react-dsfr/Card";
import Image from "next/image";

export const CertificationCard = ({
  candidacy,
}: {
  candidacy: {
    id: string;
    certification?: {
      id: string;
      codeRncp: string;
      label: string;
    } | null;
  };
}) => {
  const certification = candidacy.certification;

  if (!certification) {
    return null;
  }

  return (
    <Card
      title={certification.label}
      detail={
        <div className="flex items-center gap-2 mb-3">
          <Image
            src="/candidat/images/pictograms/verified-badge.svg"
            alt="Verified badge icon"
            width={16}
            height={16}
          />
          RNCP {certification.codeRncp}
        </div>
      }
      linkProps={{
        href: `../certification/${certification.id}`,
      }}
      enlargeLink
    />
  );
};
