import Button from "@codegouvfr/react-dsfr/Button";

export const ConfirmDropOutForm = ({
  handleConfirmDropoutCandidacy,
}: {
  handleConfirmDropoutCandidacy: (e: React.FormEvent<HTMLFormElement>) => void;
}) => (
  <>
    <hr className="pb-0.5" />

    <form className="flex flex-col" onSubmit={handleConfirmDropoutCandidacy}>
      <h2>Confirmer l'abandon du candidat</h2>
      <p>
        En confirmant que le candidat souhaite abandonner sa candidature, vous
        permettez à l'AAP d'accéder plus rapidement à la demande de paiement.
      </p>

      <Button className=" ml-auto" priority="primary">
        Confirmer l'abandon
      </Button>
    </form>
  </>
);
