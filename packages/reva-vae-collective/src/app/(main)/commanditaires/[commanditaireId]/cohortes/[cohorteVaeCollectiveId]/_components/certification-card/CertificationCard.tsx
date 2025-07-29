import { Card } from "@codegouvfr/react-dsfr/Card";

export const CertificationCard = ({
  certification,
  href,
}: {
  href?: string;
  certification?: { label: string; codeRncp: string } | null;
}) =>
  certification ? (
    <FilledCertificationCard certification={certification} href={href} />
  ) : (
    <EmptyCertificationCard href={href} />
  );

const EmptyCertificationCard = ({ href }: { href?: string }) => (
  <Card
    data-testid="empty-certification-card"
    title="Choisir la certification visée par cette cohorte"
    size="small"
    enlargeLink={true}
    linkProps={{
      href: href as string,
    }}
  />
);

const FilledCertificationCard = ({
  certification,
  href,
}: {
  certification: { label: string; codeRncp: string };
  href?: string;
}) => {
  return (
    <Card
      data-testid="filled-certification-card"
      title={certification.label}
      start={
        <div className="flex items-center gap-1 text-xs text-dsfr-light-text-mention-grey">
          <span className="ri-verified-badge-line fr-icon--sm" />
          RNCP {certification.codeRncp}
        </div>
      }
      endDetail={
        <span className="text-xs ">
          Pour changer de certification, consultez la fiche détaillée de cette
          certification.
          <br />
          Le changement de certification supprimera la sélection de l’Architecte
          Accompagnateur de parcours en cours s’il ne s’est pas positionné sur
          la nouvelle certification.
        </span>
      }
      size="small"
      enlargeLink={true}
      linkProps={{
        href: href as string,
      }}
    />
  );
};
