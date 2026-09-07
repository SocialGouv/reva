import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";

export const AccessRightsCard = ({
  accessRightsPageHref,
  className = "",
}: {
  className?: string;
  accessRightsPageHref: string;
}) => (
  <Card
    data-testid="access-rights-card"
    className={className}
    title={
      <span className="flex gap-2 items-center">
        <span className="fr-icon-lock-unlock-fill" />
        Droits d’accès
        <Button
          className="ml-auto"
          priority="secondary"
          linkProps={{ href: accessRightsPageHref }}
        >
          Modifier
        </Button>
      </span>
    }
    size="small"
    desc="Vous pouvez donner des droits d’accès à vos collaborateurs."
  />
);
