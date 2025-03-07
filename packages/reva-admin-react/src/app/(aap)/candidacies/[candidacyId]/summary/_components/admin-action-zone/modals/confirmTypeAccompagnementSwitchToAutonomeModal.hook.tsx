import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  reason: z.string().min(1, "Merci de remplir ce champ"),
});

type Form = z.infer<typeof schema>;

export const useConfirmTypeAccompagnementSwitchToAutonomeModal = () => {
  const confirmTypeAccompagnementSwitchToAutonomeModal = createModal({
    id: "confirm-type-accompagnement-switch-to-autonome",
    isOpenedByDefault: false,
  });

  const ConfirmTypeAccompagnementSwitchToAutonomeModal = ({
    onConfirmButtonClick,
  }: {
    onConfirmButtonClick: (data: { reason: string }) => void;
  }) => {
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<Form>({ resolver: zodResolver(schema) });

    const handleConfirmButtonClick = handleSubmit((data) => {
      onConfirmButtonClick(data);
      confirmTypeAccompagnementSwitchToAutonomeModal.close();
    });

    const handleCancelButtonClick = () => {
      reset({ reason: "" });
      confirmTypeAccompagnementSwitchToAutonomeModal.close();
    };

    return (
      <confirmTypeAccompagnementSwitchToAutonomeModal.Component
        title={
          <div className="flex gap-2">
            <span className="fr-icon-warning-fill" />
            Cette action est irréversible
          </div>
        }
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
            doClosesModal: false,
            onClick: handleCancelButtonClick,
          },
          {
            priority: "primary",
            children: "Confirmer",
            doClosesModal: false,
            onClick: handleConfirmButtonClick,
            type: "submit",
          },
        ]}
      >
        <form>
          <div className="flex flex-col">
            <p>
              Passer ce candidat en parcours autonome est une action définitive.
              Cela supprimera certains éléments de son espace personnel :
            </p>
            <ul className="mb-6">
              <li>Objectifs</li>
              <li>Expériences</li>
              <li>Choix de l’accompagnateur</li>
            </ul>
            <p>
              Si une décision a déjà été prise sur le dossier de faisabilité,
              elle restera accessible dans la section concernée, sous le même
              format.
            </p>
            <Input
              label="Précisez la raison de cette action :"
              hintText="Seuls les administrateurs FVAE auront accès à cette information"
              nativeInputProps={{
                ...register("reason", { required: true }),
              }}
              state={errors.reason ? "error" : "default"}
              stateRelatedMessage={errors.reason ? errors.reason?.message : ""}
            />
            <p className="mb-0">Êtes vous sûr de vouloir continuer ?</p>
          </div>
        </form>
      </confirmTypeAccompagnementSwitchToAutonomeModal.Component>
    );
  };
  return {
    Component: ConfirmTypeAccompagnementSwitchToAutonomeModal,
    open: confirmTypeAccompagnementSwitchToAutonomeModal.open,
  };
};
