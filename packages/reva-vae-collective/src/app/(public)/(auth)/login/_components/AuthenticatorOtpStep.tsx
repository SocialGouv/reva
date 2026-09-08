import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

export const AuthenticatorOtpStep = ({
  email,
  otpError,
  pending,
}: {
  email: string;
  otpError?: string;
  pending: boolean;
}) => (
  <>
    <input type="hidden" name="email" value={email} />
    <input type="hidden" name="otpType" value="authenticator" />
    <Input
      className="mb-0"
      state={otpError ? "error" : "default"}
      stateRelatedMessage={otpError}
      hintText="Saisissez le code à 6 chiffres généré par votre application d'authentification."
      nativeInputProps={{
        id: "otp",
        name: "otp",
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
        pour que Entrée dans le champ OTP valide le code et non l'annule. */}
    <Button
      className="w-full justify-center self-end mt-auto"
      disabled={pending}
    >
      Valider le code
    </Button>
    <Button
      className="mr-auto"
      priority="tertiary no outline"
      value="cancel-otp"
      nativeButtonProps={{
        type: "submit",
        name: "intent",
        formNoValidate: true,
        disabled: pending,
      }}
    >
      Retour à la connexion
    </Button>
  </>
);
