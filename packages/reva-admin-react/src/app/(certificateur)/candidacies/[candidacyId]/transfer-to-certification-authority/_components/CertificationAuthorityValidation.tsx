import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { sanitizedText } from "@/utils/input-sanitization";

import { CertificationAuthority } from "@/graphql/generated/graphql";

import { CertificationAuthorityCard } from "./CertificationAuthorityCard";

const schema = z.object({
  reason: sanitizedText(),
});
export const CertificationAuthorityValidation = ({
  certificationAuthority,
  setCertificationAuthoritySelected,
  onTransferCandidacy,
}: {
  certificationAuthority: CertificationAuthority;
  setCertificationAuthoritySelected: (
    certificationAuthority: CertificationAuthority | null,
  ) => void;
  onTransferCandidacy(transferReason: string): void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { reason: "" } });
  return (
    <>
      <div className="sm:w-1/2">
        <CertificationAuthorityCard
          certificationAuthority={certificationAuthority}
        />
      </div>
      <form onSubmit={handleSubmit((data) => onTransferCandidacy(data.reason))}>
        <Input
          label="Précisez les raisons de ce transfert :"
          textArea
          className="my-12"
          nativeTextAreaProps={register("reason")}
          state={errors.reason ? "error" : "default"}
          stateRelatedMessage={errors.reason?.message}
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
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            Transférer
          </Button>
        </div>
      </form>
    </>
  );
};
