import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

export const OtpStep = ({
  email,
  otpError,
  pending,
  otpType,
}: {
  email: string;
  otpError?: string;
  pending: boolean;
  otpType: "authenticator" | "email";
}) => {
  const hintText =
    otpType === "authenticator"
      ? "Saisissez le code à 6 chiffres généré par votre application d'authentification."
      : "Saisissez le code de vérification envoyé par email.";
  return (
    <>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="otpType" value={otpType} />
      <Input
        className="mb-0"
        state={otpError ? "error" : "default"}
        stateRelatedMessage={otpError}
        hintText={hintText}
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
};
