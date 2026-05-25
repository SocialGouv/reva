import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

export const OtpStep = ({
  email,
  totpError,
  pending,
}: {
  email: string;
  totpError?: string;
  pending: boolean;
}) => (
  <>
    <input type="hidden" name="email" value={email} />
    <Input
      className="mb-0"
      state={totpError ? "error" : "default"}
      stateRelatedMessage={totpError}
      hintText="Saisissez le code à 6 chiffres généré par votre application d'authentification."
      nativeInputProps={{
        id: "totp",
        name: "totp",
        required: true,
        inputMode: "numeric",
        autoComplete: "one-time-code",
        pattern: "[0-9]{6}",
        maxLength: 6,
        autoFocus: true,
      }}
      label="Code de vérification"
    />
    {/* Bouton de validation avant "Retour" : doit être le 1er submit du form
        pour que Entrée dans le champ TOTP valide le code et non l'annule. */}
    <Button
      className="w-full justify-center self-end mt-auto"
      disabled={pending}
    >
      Valider le code
    </Button>
    <Button
      className="mr-auto"
      priority="tertiary no outline"
      nativeButtonProps={{
        type: "submit",
        name: "intent",
        value: "cancel-otp",
        formNoValidate: true,
        disabled: pending,
      }}
    >
      Retour à la connexion
    </Button>
  </>
);
