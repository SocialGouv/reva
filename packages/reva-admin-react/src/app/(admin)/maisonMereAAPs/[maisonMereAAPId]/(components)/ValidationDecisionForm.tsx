import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";

const DecisionRadioButtons = () => {
  return (
    <RadioButtons
      small
      legend="Décision prise sur cette inscription"
      options={[
        {
          label: "Accepté",
          nativeInputProps: {
            value: "ACCEPTED",
          },
        },
        {
          label: "Demande de précision",
          nativeInputProps: {
            value: "PENDING",
          },
        },
      ]}
    />
  );
};

export default function ValidationDecisionForm() {
  return (
    <div className="w-full">
      <form>
        <div className="grid grid-cols-2 gap-x-8">
          <fieldset className="grid">
            {/* <legend>Décision prise sur cette inscription</legend> */}
            <RadioButtons
              small
              legend="Décision prise sur cette inscription"
              options={[
                {
                  label: "Accepté",
                  nativeInputProps: {
                    value: "ACCEPTED",
                  },
                },
                {
                  label: "Demande de précision",
                  nativeInputProps: {
                    value: "PENDING",
                  },
                },
              ]}
            />
            <Input
              label="Commentaire à destination de l'AAP : "
              textArea
              nativeTextAreaProps={{
                name: "commentaire",
                rows: 4,
              }}
            />
            <SmallNotice>
              L'AAP recevra ce commentaire dans le mail de décision
            </SmallNotice>
          </fieldset>
          <fieldset className="grid border p-4">
            <Input
              label="Description interne"
              hintText="(optionnel)"
              textArea
              nativeTextAreaProps={{
                name: "commentaire",
                rows: 8,
              }}
            />
            <SmallNotice>
              Non visible par l’AAP / Signer ce commentaire pour le suivi des
              décisions
            </SmallNotice>
          </fieldset>
        </div>
        <div className="w-full mt-8 flex flex-row justify-between">
          <Button priority="secondary" linkProps={{ href: "/subscriptions/check-legal-information/" }} >Retour</Button>
          <Button>Envoyer</Button>
        </div>
      </form>
    </div>
  );
}
