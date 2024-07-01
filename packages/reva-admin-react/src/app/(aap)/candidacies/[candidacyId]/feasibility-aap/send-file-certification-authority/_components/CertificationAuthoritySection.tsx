export default function CertificationAuthoritySection({
  certificationAuthorityLabel,
}: {
  certificationAuthorityLabel?: string;
}) {
  if (!certificationAuthorityLabel) {
    return null;
  }

  return (
    <div className="mt-3 mb-12">
      <div className="flex mb-4">
        <span className="fr-icon-team-fill fr-icon--lg mr-2" />
        <h2 className="mb-0">Certificateur</h2>
      </div>
      <p>{certificationAuthorityLabel}</p>
    </div>
  );
}
