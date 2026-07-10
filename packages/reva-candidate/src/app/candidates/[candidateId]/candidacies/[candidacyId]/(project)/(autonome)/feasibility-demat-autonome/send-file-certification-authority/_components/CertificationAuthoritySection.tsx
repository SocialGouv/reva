import Select from "@codegouvfr/react-dsfr/Select";

type CertificationAuthorityProps = {
  certificationAuthorities: { label: string; id: string }[];
  certificationAuthoritySelectedId: string;
  certificationAuthoritySelectError: boolean;
  setCertificationAuthoritySelectedId: (id: string) => void;
  feasibilityHasBeenSentToCertificationAuthority: boolean;
};

const CertificateursSelect = ({
  certificationAuthorities,
  certificationAuthoritySelectedId,
  certificationAuthoritySelectError,
  setCertificationAuthoritySelectedId,
}: Omit<
  CertificationAuthorityProps,
  "feasibilityHasBeenSentToCertificationAuthority"
>) => {
  return (
    <>
      <p className="mb-3">
        <strong>Certificateur</strong>
        <br />
        <span className="text-sm">
          Plusieurs certificateurs sont disponibles sur ce diplôme.
        </span>
      </p>
      <Select
        label={
          <label className="block mt-[6px] mb-[10px]">
            Sélectionnez l'autorité de certification
          </label>
        }
        state={certificationAuthoritySelectError ? "error" : "default"}
        stateRelatedMessage={
          certificationAuthoritySelectError
            ? "Veuillez choisir une autorité de certification"
            : ""
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
            Sélectionner une option
          </option>
          {certificationAuthorities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </>
      </Select>
    </>
  );
};

export default function CertificationAuthoritySection({
  certificationAuthorities,
  certificationAuthoritySelectedId,
  certificationAuthoritySelectError,
  setCertificationAuthoritySelectedId,
  feasibilityHasBeenSentToCertificationAuthority,
}: CertificationAuthorityProps) {
  if (
    !certificationAuthorities.length ||
    feasibilityHasBeenSentToCertificationAuthority
  ) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center p-6 border-b border-gray-200">
        <span className="fr-icon-team-line fr-icon--lg mr-2" />
        <h5 className="mb-0">Contacts</h5>
      </div>
      <div className="p-6">
        {certificationAuthorities.length === 1 ? (
          <p>{certificationAuthorities[0].label}</p>
        ) : (
          <CertificateursSelect
            certificationAuthorities={certificationAuthorities}
            certificationAuthoritySelectedId={certificationAuthoritySelectedId}
            certificationAuthoritySelectError={
              certificationAuthoritySelectError
            }
            setCertificationAuthoritySelectedId={
              setCertificationAuthoritySelectedId
            }
          />
        )}
      </div>
    </div>
  );
}
