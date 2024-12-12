import { Button } from "@codegouvfr/react-dsfr/Button";

export const FormButtons = ({
  backUrl,
  submitButtonLabel = "Enregistrer",
  formState: { isDirty, isSubmitting, canSubmit = true },
  className,
}: {
  backUrl?: string;
  formState: {
    isDirty: boolean;
    isSubmitting: boolean;
    canSubmit?: boolean;
  };
  submitButtonLabel?: string;
  className?: string;
}) => {
  return (
    <div
      className={`flex gap-4 items-center justify-between mt-10 ${className || ""}`}
      data-test="form-buttons"
    >
      {backUrl && (
        <Button priority="secondary" linkProps={{ href: backUrl }}>
          Retour
        </Button>
      )}
      <div className="flex gap-x-2 ml-auto">
        <Button type="reset" priority="tertiary no outline" disabled={!isDirty}>
          Réinitialiser
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty || !canSubmit}>
          {submitButtonLabel}
        </Button>
      </div>
    </div>
  );
};
