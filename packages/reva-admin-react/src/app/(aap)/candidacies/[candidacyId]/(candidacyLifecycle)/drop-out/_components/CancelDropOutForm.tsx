import Button from "@codegouvfr/react-dsfr/Button";

export const CancelDropOutForm = ({
  handleCancelDropoutCandidacy,
}: {
  handleCancelDropoutCandidacy: (e: React.FormEvent<HTMLFormElement>) => void;
}) => (
  <>
    <hr className="pb-0.5" />
    <form className="flex flex-col" onSubmit={handleCancelDropoutCandidacy}>
      <h2>Annuler l'abandon du candidat</h2>
      <p>
        En annulant l'abandon du candidat, il pourra reprendre son parcours là
        où il en était rendu.{" "}
        <strong>
          Vous vous êtes assuré que les raisons étaient juridiquement
          respectables
        </strong>
        . Cette annulation sera visible dans le journal des actions.
      </p>

      <Button className=" ml-auto" priority="primary">
        Annuler l'abandon
      </Button>
    </form>
  </>
);
