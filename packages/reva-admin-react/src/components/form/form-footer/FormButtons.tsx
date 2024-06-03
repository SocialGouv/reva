import { Button } from "@codegouvfr/react-dsfr/Button";

export const FormButtons = ({
  backUrl,
  formState: { isDirty, isSubmitting, canSubmit = true },
  className,
}: {
  backUrl?: string;
  formState: {
    isDirty: boolean;
    isSubmitting: boolean;
    canSubmit?: boolean;
  };
  className?: string;
}) => {
  return (
    <div
      className={`flex gap-4 items-center justify-between mt-10 ${className || ""}`}
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
          Enregistrer
        </Button>
      </div>
    </div>
  );
};
