import { CertificationAuthorityLocalAccount } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { useForm } from "react-hook-form";
import { CertificationAuthorityLocalAccountCard } from "./CertificationAuthorityLocalAccountCard";

export const CertificationAuthorityLocalAccountValidation = ({
  certificationAuthorityLocalAccount,
  setCertificationAuthorityLocalAccountSelected,
  onTransferCandidacy,
}: {
  certificationAuthorityLocalAccount: CertificationAuthorityLocalAccount;
  setCertificationAuthorityLocalAccountSelected: (
    certificationAuthorityLocalAccount: CertificationAuthorityLocalAccount | null,
  ) => void;
  onTransferCandidacy(transferReason: string): void;
}) => {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  return (
    <>
      <div className="sm:w-1/2">
        <CertificationAuthorityLocalAccountCard
          certificationAuthorityLocalAccount={
            certificationAuthorityLocalAccount
          }
        />
      </div>
      <form onSubmit={handleSubmit((data) => onTransferCandidacy(data.reason))}>
        <div className="flex gap-2 justify-end">
          <Button
            priority="secondary"
            onClick={() => setCertificationAuthorityLocalAccountSelected(null)}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Transférer
          </Button>
        </div>
      </form>
    </>
  );
};
