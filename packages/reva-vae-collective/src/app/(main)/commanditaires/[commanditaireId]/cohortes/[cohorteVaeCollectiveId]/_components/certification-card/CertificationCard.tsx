import { Tile } from "@codegouvfr/react-dsfr/Tile";

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
  <Tile
    data-testid="empty-certification-card"
    title="Choisir la certification visée par cette cohorte"
    small
    orientation="horizontal"
    enlargeLinkOrButton={true}
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
    <Tile
      data-testid="filled-certification-card"
      title={certification.label}
      start={
        <div className="flex items-center gap-1 text-xs text-dsfr-light-text-mention-grey">
          <span className="ri-verified-badge-line fr-icon--sm" />
          RNCP {certification.codeRncp}
        </div>
      }
      detail={
        <>
          Pour changer de certification, consultez la fiche détaillée de cette
          certification.
          <br />
          Le changement de certification supprimera la sélection de l’Architecte
          Accompagnateur de parcours en cours s’il ne s’est pas positionné sur
          la nouvelle certification.
        </>
      }
      small
      orientation="horizontal"
      enlargeLinkOrButton={true}
      linkProps={{
        href: href as string,
      }}
    />
  );
};
