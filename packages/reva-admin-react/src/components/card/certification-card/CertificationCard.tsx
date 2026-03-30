import Card from "@codegouvfr/react-dsfr/Card";
import Image from "next/image";

export const CertificationCard = ({
  certification,
}: {
  certification?: {
    id: string;
    codeRncp: string;
    label: string;
  } | null;
}) => {
  if (!certification) {
    return null;
  }

  return (
    <Card
      title={certification.label}
      size="small"
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
      linkProps={{
        href: `/certification-details/${certification.id}?candidacyId=${certification.id}`,
      }}
      enlargeLink
    />
  );
};
