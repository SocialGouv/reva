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
    <dl>
      <dt className="uppercase font-bold">Raison sociale</dt>
      <dd>{label}</dd>
      <br />
      <dl className="uppercase font-bold">Email de contact</dl>
      <dd>{email}</dd>
    </dl>
    {href && (
      <Button className="ml-auto" linkProps={{ href }}>
        Voir plus
      </Button>
    )}
  </GrayCard>
);
