import { CallOut } from "@codegouvfr/react-dsfr/CallOut";

export const CertificationAuthorityInfoCallout = ({
  name,
  email,
  label,
}: {
  name: string;
  email: string;
  label: string;
}) => (
  <CallOut title="Comment contacter mon certificateur ?" className="mt-8">
    <span className="mt-2 block">{label}</span>
    <span className="block">{name}</span>
    <span>{email}</span>
  </CallOut>
);
