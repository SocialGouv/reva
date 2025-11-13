import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

export const FiltersSection = () => {
  return (
    <div className="w-1/4 flex flex-col gap-4">
      <h2 className="mb-0">Statut :</h2>
      <Accordion label="Dossier de faisabilité" className="bg-white">
        <Checkbox
          options={[
            {
              label: "Nouveau dossier",
              nativeInputProps: { checked: false },
            },
            {
              label: "Complet (En attente de recevabilité)",
              nativeInputProps: { checked: false },
            },
            { label: "Incomplet", nativeInputProps: { checked: false } },
            { label: "Recevable", nativeInputProps: { checked: false } },
            {
              label: "Non recevable",
              nativeInputProps: { checked: false },
            },
          ]}
        />
      </Accordion>

      <Accordion label="Dossier de validation" className="bg-white">
        <Checkbox
          options={[
            {
              label: "Reçu",
              nativeInputProps: { checked: false },
            },
            {
              label: "Signalé",
              nativeInputProps: { checked: false },
            },
          ]}
        />
      </Accordion>

      <Accordion label="Passage devant le jury" className="bg-white">
        <Checkbox
          options={[
            {
              label: "A programmer",
              nativeInputProps: { checked: false },
            },
            {
              label: "Programmé",
              nativeInputProps: { checked: false },
            },
          ]}
        />
      </Accordion>

      <Accordion label="Résultat de jury" className="bg-white">
        <Checkbox
          options={[
            {
              label: "En attente de résultat",
              nativeInputProps: { checked: false },
            },
            {
              label: "Réussite totale",
              nativeInputProps: { checked: false },
            },
            {
              label: "Réussite partielle",
              nativeInputProps: { checked: false },
            },
            {
              label: "Non validation",
              nativeInputProps: { checked: false },
            },
            {
              label: "Non présentation au jury",
              nativeInputProps: { checked: false },
            },
          ]}
        />
      </Accordion>

      <Accordion label="VAE Collective" className="bg-white">
        <Checkbox
          options={[
            {
              label: "Cohorte 1",
              nativeInputProps: { checked: false },
            },
            {
              label: "Cohorte 2",
              nativeInputProps: { checked: false },
            },
            {
              label: "Cohorte 3",
              nativeInputProps: { checked: false },
            },
          ]}
        />
      </Accordion>

      <div className="bg-white p-4 border-b border-neutral-300">
        <ToggleSwitch
          label="Afficher les candidatures abandonnées"
          inputTitle="Afficher les candidatures abandonnées"
          labelPosition="left"
        />
      </div>
    </div>
  );
};
