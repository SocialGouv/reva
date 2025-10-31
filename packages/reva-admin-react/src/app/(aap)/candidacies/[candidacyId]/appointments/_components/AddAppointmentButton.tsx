import { Button } from "@codegouvfr/react-dsfr/Button";

export const AddAppointmentButton = ({
  addAppointmentButtonDisabled,
  candidacyId,
  className,
}: {
  addAppointmentButtonDisabled: boolean;
  candidacyId: string;
  className?: string;
}) => {
  const addAppointmentButtonExtraProps = addAppointmentButtonDisabled
    ? { disabled: true }
    : {
        linkProps: {
          href: `/candidacies/${candidacyId}/appointments/add-appointment?type=RENDEZ_VOUS_DE_SUIVI`,
        },
      };

  return (
    <Button
      className={className || ""}
      data-testid="add-appointment-button"
      priority="tertiary no outline"
      iconId="fr-icon-add-line"
      {...addAppointmentButtonExtraProps}
    >
      Ajouter un rendez-vous
    </Button>
  );
};
