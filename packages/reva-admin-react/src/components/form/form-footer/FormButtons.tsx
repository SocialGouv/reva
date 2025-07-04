import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useRouter } from "next/navigation";

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
            "data-test": "stay-on-page-button",
            "aria-label":
              "Rester sur la page et continuer à éditer le formulaire",
          },
        },
        {
          priority: "primary",
          onClick: onConfirm,
          children: "Quitter",
          nativeButtonProps: {
            type: "button",
            "aria-label": "Quitter la page sans enregistrer les modifications",
            "data-test": "leave-page-button",
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

export const FormButtons = ({
  backUrl,
  submitButtonLabel = "Enregistrer",
  formState: { isDirty, isSubmitting, canSubmit = true },
  className,
  disabled,
  hideResetButton,
}: {
  backUrl?: string;
  formState: {
    isDirty: boolean;
    isSubmitting: boolean;
    canSubmit?: boolean;
  };
  submitButtonLabel?: string;
  className?: string;
  disabled?: boolean;
  hideResetButton?: boolean;
}) => {
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
        data-test="form-buttons"
        role="group"
        aria-label="Actions du formulaire"
      >
        {backUrl && (
          <Button
            priority="secondary"
            onClick={navigateBack}
            type="button"
            aria-label="Retour à la page précédente"
            data-test="back-button"
          >
            Retour
          </Button>
        )}
        <div className="flex gap-x-2 ml-auto">
          {!hideResetButton && (
            <Button
              type="reset"
              priority="tertiary no outline"
              disabled={!isDirty || disabled}
              aria-label="Réinitialiser le formulaire"
            >
              Réinitialiser
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty || !canSubmit || disabled}
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
