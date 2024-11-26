import Select from "@codegouvfr/react-dsfr/Select";

type CertificationAuthorityProps = {
  certificationAuthorities: { label: string; id: string }[];
  certificationAuthoritySelectedId: string;
  setCertificationAuthoritySelectedId: (id: string) => void;
  feasibilitySentToCertificationAuthorityLabel: string | undefined;
};

const CertificateursSelect = ({
  certificationAuthorities,
  certificationAuthoritySelectedId,
  setCertificationAuthoritySelectedId,
}: Omit<
  CertificationAuthorityProps,
  "feasibilitySentToCertificationAuthorityLabel"
>) => {
  return (
    <Select
      label={
        <label className="block mt-[6px] mb-[10px] text-xs font-semibold">
          SÉLECTIONNEZ L'AUTORITÉ DE CERTIFICATION
        </label>
      }
      nativeSelectProps={{
        onChange: (event) =>
          setCertificationAuthoritySelectedId(event.target.value),
        value: certificationAuthoritySelectedId || "",
        required: true,
      }}
    >
      <>
        <option disabled hidden value="">
          Sélectionner
        </option>
        {certificationAuthorities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </>
    </Select>
  );
};

const SectionContent = ({
  certificationAuthorities,
  certificationAuthoritySelectedId,
  setCertificationAuthoritySelectedId,
  feasibilitySentToCertificationAuthorityLabel,
}: CertificationAuthorityProps) => {
  if (feasibilitySentToCertificationAuthorityLabel) {
    return <p>{feasibilitySentToCertificationAuthorityLabel}</p>;
  }

  if (certificationAuthorities.length === 1) {
    return <p>{certificationAuthorities[0].label}</p>;
  }

  return (
    <CertificateursSelect
      certificationAuthorities={certificationAuthorities}
      certificationAuthoritySelectedId={certificationAuthoritySelectedId}
      setCertificationAuthoritySelectedId={setCertificationAuthoritySelectedId}
    />
  );
};

export default function CertificationAuthoritySection({
  certificationAuthorities,
  certificationAuthoritySelectedId,
  setCertificationAuthoritySelectedId,
  feasibilitySentToCertificationAuthorityLabel,
}: CertificationAuthorityProps) {
  if (!certificationAuthorities.length) {
    return null;
  }

  return (
    <div className="mt-3 mb-12">
      <div className="flex mb-4">
        <span className="fr-icon-team-fill fr-icon--lg mr-2" />
        <h2 className="mb-0">Certificateur</h2>
      </div>
      <SectionContent
        certificationAuthorities={certificationAuthorities}
        certificationAuthoritySelectedId={certificationAuthoritySelectedId}
        setCertificationAuthoritySelectedId={
          setCertificationAuthoritySelectedId
        }
        feasibilitySentToCertificationAuthorityLabel={
          feasibilitySentToCertificationAuthorityLabel
        }
      />
    </div>
  );
}
