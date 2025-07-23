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
}) => (
  <Tile
    data-testid="empty-certification-card"
    title="Choisir la certification visée par cette cohorte"
    small
    enlargeLinkOrButton
    orientation="horizontal"
    linkProps={{
      href: `/vae-collective/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications`,
    }}
    disabled={disabled}
  />
);

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
}) => (
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
        Accompagnateur de parcours en cours s’il ne s’est pas positionné sur la
        nouvelle certification.
      </>
    }
    small
    enlargeLinkOrButton
    orientation="horizontal"
    linkProps={{
      href: `/vae-collective/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications`,
    }}
    disabled={disabled}
  />
);
