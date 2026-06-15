import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

export const EmailOtpStep = ({
  email,
  otpError,
  pending,
}: {
  email: string;
  otpError?: string;
  pending: boolean;
}) => {
  return (
    <div className="flex flex-col gap-8">
      <Alert
        small
        severity="info"
        description={`Pour sécuriser votre accès, nous avons envoyé un code de vérification à ${email}`}
      />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="otpType" value="email" />
      <Input
        className="mb-0"
        state={otpError ? "error" : "default"}
        stateRelatedMessage={otpError}
        hintText="Saisissez le code de vérification à 6 chiffres, valable 10 minutes"
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
        label="Vérification de votre identité"
      />
      {/* Bouton de validation avant "Retour" : doit être le 1er submit du form
        pour que Entrée dans le champ OTP valide le code et non l'annule. */}
      <Button
        className="w-full justify-center self-end mt-auto"
        disabled={pending}
      >
        Valider
      </Button>
      <Button
        className="mr-auto"
        priority="tertiary"
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
    </div>
  );
};
