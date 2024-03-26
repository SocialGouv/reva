import { Button } from "@codegouvfr/react-dsfr/Button";

export const FormButtons = ({
  backUrl,
  formState: { isDirty, isSubmitting },
}: {
  backUrl: string;
  formState: {
    isDirty: boolean;
    isSubmitting: boolean;
  };
}) => {
  return (
    <div className="flex gap-4 items-center justify-between mt-10">
      <Button
        className="mb-6"
        priority="secondary"
        linkProps={{ href: backUrl }}
      >
        Retour
      </Button>
      <div className="flex gap-x-2">
        <Button type="reset" priority="tertiary no outline" disabled={!isDirty}>
          Réinitialiser
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
};
