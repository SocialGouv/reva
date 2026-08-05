import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";

type CertificationsCardProps = {
  numberOfCertifications: number;
  disabled?: boolean;
} & (
  | { cohorteStatus: "PUBLIE"; certificationsSelectionneesHref: string }
  | { cohorteStatus: "BROUILLON"; selectCertificationsHref: string }
);

export const CertificationsCard = (props: CertificationsCardProps) => {
  return (
    <Card
      data-testid="certifications-card"
      title={
        <span className="flex gap-2 items-center">
          <span className="fr-icon-award-fill" />
          Certification(s) visée(s)
          <Tag small className="font-normal mt-1 ml-2">
            {props.numberOfCertifications} certification(s)
          </Tag>
          {props.cohorteStatus === "PUBLIE" && (
            <Button
              className="ml-auto"
              priority="tertiary no outline"
              linkProps={{ href: props.certificationsSelectionneesHref }}
            >
              Visualiser
            </Button>
          )}
          {props.cohorteStatus === "BROUILLON" &&
            (props.numberOfCertifications > 0 ? (
              <Button
                className="ml-auto"
                priority="tertiary"
                {...(props.disabled
                  ? { disabled: true }
                  : { linkProps: { href: props.selectCertificationsHref } })}
              >
                Modifier
              </Button>
            ) : (
              <Button
                className="ml-auto text-white"
                {...(props.disabled
                  ? { disabled: true }
                  : { linkProps: { href: props.selectCertificationsHref } })}
              >
                Compléter
              </Button>
            ))}
        </span>
      }
      size="small"
      desc="Le choix des certifications visées par cette cohorte vous permettra d'accéder à la recherche de l'accompagnateur de votre choix."
    />
  );
};
