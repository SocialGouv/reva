import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";

export const CertificationsCard = ({
  numberOfCertifications,
  certificationsSelectionneesHref,
}: {
  numberOfCertifications: number;
  certificationsSelectionneesHref: string;
}) => (
  <Card
    data-testid="certifications-card"
    title={
      <span className="flex gap-2 items-center">
        <span className="fr-icon-award-fill" />
        Certification(s) visée(s)
        <Tag small className="font-normal mt-1 ml-2">
          {numberOfCertifications} certification(s)
        </Tag>
        <Button
          className="ml-auto"
          priority="tertiary no outline"
          linkProps={{ href: certificationsSelectionneesHref }}
        >
          Visualiser
        </Button>
      </span>
    }
    size="small"
    desc="Le choix des certifications visées par cette cohorte vous permettra d'accéder à la recherche de l'accompagnateur de votre choix."
  />
);
