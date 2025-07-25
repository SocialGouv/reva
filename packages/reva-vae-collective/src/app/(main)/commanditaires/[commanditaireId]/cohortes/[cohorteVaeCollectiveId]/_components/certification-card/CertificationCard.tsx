import { Tile } from "@codegouvfr/react-dsfr/Tile";

export const CertificationCard = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  certification,
  disabled,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  certification?: { label: string; codeRncp: string } | null;
  disabled: boolean;
}) =>
  certification ? (
    <FilledCertificationCard
      commanditaireId={commanditaireId}
      cohorteVaeCollectiveId={cohorteVaeCollectiveId}
      certification={certification}
      disabled={disabled}
    />
  ) : (
    <EmptyCertificationCard
      commanditaireId={commanditaireId}
      cohorteVaeCollectiveId={cohorteVaeCollectiveId}
      disabled={disabled}
    />
  );

const EmptyCertificationCard = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  disabled,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  disabled: boolean;
}) => {
  const additionalProps = disabled
    ? { disabled: true, buttonProps: { disabled: true } }
    : {
        enlargeLinkOrButton: true,
        linkProps: {
          href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications`,
        },
      };

  return (
    <Tile
      data-testid="empty-certification-card"
      title="Choisir la certification visée par cette cohorte"
      small
      orientation="horizontal"
      {...additionalProps}
    />
  );
};

const FilledCertificationCard = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  certification,
  disabled,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  certification: { label: string; codeRncp: string };
  disabled: boolean;
}) => {
  const additionalProps = disabled
    ? { disabled: true, buttonProps: { disabled: true } }
    : {
        enlargeLinkOrButton: true,
        linkProps: {
          href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications`,
        },
      };

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
      {...additionalProps}
    />
  );
};
