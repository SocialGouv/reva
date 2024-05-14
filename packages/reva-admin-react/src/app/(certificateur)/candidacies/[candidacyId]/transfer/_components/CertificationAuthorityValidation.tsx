import { CertificationAuthority } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { CertificationAuthorityCard } from "./CertificationAuthorityCard";

export const CertificationAuthorityValidation = ({
  certificationAuthority,
  setCertificationAuthoritySelected,
  onTransferCandidacy,
  reason,
  setReason,
}: {
  certificationAuthority: CertificationAuthority;
  setCertificationAuthoritySelected: (
    certificationAuthority: CertificationAuthority | null,
  ) => void;
  onTransferCandidacy(): void;
  reason: string;
  setReason: (reason: string) => void;
}) => {
  return (
    <>
      <div className="sm:w-1/2">
        <CertificationAuthorityCard
          certificationAuthority={certificationAuthority}
        />
      </div>
      <Input
        label="Précisez les raisons de ce transfert :"
        textArea
        className="my-12"
        nativeTextAreaProps={{
          value: reason,
          onChange: (e) => setReason(e.target.value),
        }}
      />
      <p>
        L'accompagnateur en charge de la candidature sera notifié de ce
        transfert vers un nouveau service.
      </p>
      <div className="flex gap-2 justify-end">
        <Button
          priority="secondary"
          onClick={() => setCertificationAuthoritySelected(null)}
        >
          Annuler
        </Button>
        <Button onClick={onTransferCandidacy}>Transférer</Button>
      </div>
    </>
  );
};
