import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMemo } from "react";

export const resultInconsistencyErrorModal = createModal({
  id: "result-inconsistency-error",
  isOpenedByDefault: false,
});

export type ResultInconsistencyType =
  | "ALL_BLOCKS_CHECKED_FOR_PARTIAL_RESULT"
  | "NO_BLOCKS_CHECKED_FOR_SUCCESS_RESULT";

type Props = {
  inconsistencyType: ResultInconsistencyType;
  selectedBlocks: { id: string; label: string }[];
};

export const ResultInconsistencyErrorModal = ({
  inconsistencyType,
  selectedBlocks,
}: Props) => {
  const inconsistencyMessage = useMemo(() => {
    switch (inconsistencyType) {
      case "ALL_BLOCKS_CHECKED_FOR_PARTIAL_RESULT":
        return (
          <>
            <p>
              Vous avez coché tous les blocs présentés lors de ce passage (
              <em>{selectedBlocks.map((block) => block.label).join(", ")}</em>)
              mais sélectionné "Certains blocs visés ont été validés pour ce
              jury".
            </p>
            <p>
              Pour envoyer ce résultat, vous devez corriger cette incohérence :
            </p>
            <p>
              <b>
                Si tous les blocs recevables ont été validés lors de ce passage
              </b>
              <br />
              <i className="fr-icon-arrow-right-line fr-icon--sm" />{" "}
              Sélectionnez <b>"Tous les blocs visés ont été validés"</b>
            </p>
            <p>
              <b>Si certains blocs recevables n'ont pas été validés</b>
              <br />
              <i className="fr-icon-arrow-right-line fr-icon--sm" /> Décochez
              les blocs non validés
            </p>
          </>
        );
      case "NO_BLOCKS_CHECKED_FOR_SUCCESS_RESULT":
        return (
          <>
            <p>
              Vous n'avez coché aucun bloc présenté lors de ce passage mais
              séléctionné un résultat de réussite.
            </p>
            <p>
              <b>Si aucun bloc n'a été validé</b>
              <br />
              <i className="fr-icon-arrow-right-line fr-icon--sm" />{" "}
              Sélectionnez un résultat de non validation
            </p>
            <p>
              <b>Si certains blocs ont été validés</b>
              <br />
              <i className="fr-icon-arrow-right-line fr-icon--sm" /> Cochez les
              blocs validés
            </p>
          </>
        );
    }
  }, [inconsistencyType, selectedBlocks]);
  return (
    <resultInconsistencyErrorModal.Component
      title="Incohérence de saisie"
      size="large"
      iconId="fr-icon-warning-fill"
      titleProps={{
        className: "flex gap-2",
      }}
    >
      <p>{inconsistencyMessage}</p>
    </resultInconsistencyErrorModal.Component>
  );
};
