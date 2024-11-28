export const CertificationAuthoritySection = ({
  certificationAuthorityLabel,
}: {
  certificationAuthorityLabel?: string;
}) => {
  if (!certificationAuthorityLabel) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex">
        <span className="fr-icon-team-fill fr-icon--lg mr-2" />
        <h2>Certificateur</h2>
      </div>
      <p className="mb-0">{certificationAuthorityLabel}</p>
    </div>
  );
};
