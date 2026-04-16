"use client";

import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { TextareaHTMLAttributes } from "react";

export const revokeJuryDecisionModal = createModal({
  id: "revoke-jury-decision",
  isOpenedByDefault: false,
});

type RevokeJuryDecisionModalProps = {
  onConfirm: () => void;
  isSubmitting: boolean;
  reasonTextAreaProps: TextareaHTMLAttributes<HTMLTextAreaElement>;
};

export const RevokeJuryDecisionModal = ({
  onConfirm,
  isSubmitting,
  reasonTextAreaProps,
}: RevokeJuryDecisionModalProps) => (
  <revokeJuryDecisionModal.Component
    title={
      <div className="flex gap-2">
        <span className="fr-icon--lg fr-icon-warning-fill" aria-hidden="true" />
        Annuler une décision prise par un certificateur.
      </div>
    }
    buttons={[
      {
        priority: "secondary",
        children: "Retour",
      },
      {
        priority: "primary",
        onClick: onConfirm,
        children: "Confirmer",
        disabled: isSubmitting,
      },
    ]}
    size="large"
  >
    <p>
      Vous êtes sur le point d'annuler une décision prise par un certificateur.
      Cette action l'obligera à prononcer sa décision de nouveau. Vous ne
      pourrez pas prendre de décision définitive à sa place.
    </p>
    <Input
      label="Commentaire : (Optionnel)"
      nativeTextAreaProps={{ rows: 3, ...reasonTextAreaProps }}
      textArea
    />
    <p>Voulez vous confirmer l'annulation de cette décision ?</p>
  </revokeJuryDecisionModal.Component>
);
