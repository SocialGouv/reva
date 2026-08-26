import { Button } from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

export type BlockKey = "siret" | "manager" | "administrator" | "contact";

const BLOCKS: { key: BlockKey; label: string }[] = [
  { key: "siret", label: "Numéro de SIRET" },
  { key: "manager", label: "Identité du dirigeant" },
  { key: "administrator", label: "Identité de l'administrateur de compte" },
  { key: "contact", label: "Informations de connexion et de contact" },
];

export const BlockSelectionStep = ({
  isAdmin,
  selectedBlocks,
  onToggleBlock,
  onStart,
  cancelUrl,
}: {
  isAdmin: boolean;
  selectedBlocks: BlockKey[];
  onToggleBlock: (key: BlockKey) => void;
  onStart: () => void;
  cancelUrl: string;
}) => (
  <>
    <Checkbox
      small
      className="mt-4"
      legend="Quelles informations souhaitez-vous mettre à jour ?"
      hintText={
        isAdmin
          ? "Sélectionnez le ou les élément(s) que vous souhaitez modifier. La mise à jour sera effective pour l'AAP dès l'enregistrement de celle-ci. Assurez vous d'avoir vérifié les pièces justificatives nécessaires pour ces modifications."
          : "Sélectionnez le ou les élément(s) que vous souhaitez modifier. Les pièces justificatives demandées dépendent de votre sélection. Votre demande sera vérifiée par un administrateur France VAE."
      }
      options={BLOCKS.map(({ key, label }) => ({
        label,
        nativeInputProps: {
          checked: selectedBlocks.includes(key),
          onChange: () => onToggleBlock(key),
        },
      }))}
    />
    <div className="flex justify-between mt-12">
      <Button priority="secondary" linkProps={{ href: cancelUrl }}>
        Annuler
      </Button>
      <Button disabled={!selectedBlocks.length} onClick={onStart}>
        Commencer
      </Button>
    </div>
  </>
);
