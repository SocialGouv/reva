import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const Card = ({
  label,
  email,
  href,
}: {
  label: string;
  email: string;
  href?: string;
}) => (
  <GrayCard>
    <strong>RAISON SOCIALE</strong>
    <p>{label}</p>
    <br />
    <strong>EMAIL DE CONTACT</strong>
    <p>{email}</p>
    {href && (
      <Button className="ml-auto" linkProps={{ href }}>
        Voir plus
      </Button>
    )}
  </GrayCard>
);
