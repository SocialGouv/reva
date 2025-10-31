import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/back-button/BackButton";

const backConfirmationModal = createModal({
  id: "back-confirmation-modal",
  isOpenedByDefault: false,
});

const BackConfirmationModal = ({ onConfirm }: { onConfirm(): void }) => {
  return (
    <backConfirmationModal.Component
      title="Voulez-vous vraiment quitter la page ?"
      buttons={[
        {
          priority: "secondary",
          children: "Rester sur la page",
          nativeButtonProps: {
            type: "button",
            "aria-label":
              "Rester sur la page et continuer à éditer le formulaire",
            "data-testid": "stay-on-page-button",
          },
        },
        {
          priority: "primary",
          onClick: onConfirm,
          children: "Quitter",
          nativeButtonProps: {
            type: "button",
            "aria-label": "Quitter la page sans enregistrer les modifications",
            "data-testid": "leave-page-button",
          },
        },
      ]}
    >
      <p>
        La page en cours contient des modifications qui n'ont pas été
        enregistrées. Si vous quittez sans enregistrer, les modifications seront
        perdues.
      </p>
    </backConfirmationModal.Component>
  );
};

interface FormButtonsProps {
  backUrl?: string;
  formState: {
    isDirty: boolean;
    isSubmitting: boolean;
    canSubmit?: boolean;
  };
  submitButtonLabel?: string;
  className?: string;
}

export const FormButtons = ({
  backUrl,
  submitButtonLabel = "Enregistrer",
  formState: { isDirty, isSubmitting, canSubmit = true },
  className,
}: FormButtonsProps) => {
  const router = useRouter();

  const navigateBack = () => {
    if (!backUrl) return;

    if (isDirty) {
      backConfirmationModal.open();
    } else {
      router.push(backUrl);
    }
  };

  return (
    <>
      <div
        className={`flex gap-4 items-center justify-between mt-10 ${className || ""}`}
        data-testid="form-buttons"
        role="group"
        aria-label="Actions du formulaire"
      >
        {backUrl && <BackButton navigateBack={navigateBack} />}
        <div className="flex gap-x-2 ml-auto">
          <Button
            type="reset"
            priority="tertiary no outline"
            disabled={!isDirty}
            aria-label="Réinitialiser le formulaire"
          >
            Réinitialiser
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty || !canSubmit}
            aria-label={`${submitButtonLabel} le formulaire`}
          >
            {submitButtonLabel}
          </Button>
        </div>
      </div>
      {backUrl && (
        <BackConfirmationModal onConfirm={() => router.push(backUrl)} />
      )}
    </>
  );
};
