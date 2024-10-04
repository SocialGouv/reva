import { CallOut } from "@codegouvfr/react-dsfr/CallOut";

export const CertificationAuthorityInfoCallout = ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => (
  <CallOut title="Comment contacter mon certificateur ?" className="mt-8">
    <span className="mt-2 block">{name}</span>
    <span>{email}</span>
  </CallOut>
);
