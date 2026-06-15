"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";

import { resendEmailOtp } from "../actions";

export const EmailOtpStep = ({
  email,
  otpError,
  pending,
}: {
  email: string;
  otpError?: string;
  pending: boolean;
}) => {
  const [otpResent, setOtpResent] = useState(false);

  const resendOtp = async () => {
    await resendEmailOtp(email);
    setOtpResent(true);
  };
  return (
    <div className="flex flex-col gap-8">
      {otpResent ? (
        <Alert
          small
          severity="success"
          description={
            <p>
              Un nouveau code a été envoyé à {email}.
              <br /> Ce code est valable 10 minutes.
            </p>
          }
        />
      ) : (
        <Alert
          small
          severity="info"
          description={`Pour sécuriser votre accès, nous avons envoyé un code de vérification à ${email}`}
        />
      )}
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
      <div className="flex gap-4">
        <Button
          className="mr-auto w-full justify-center"
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
        <Button
          className="w-full justify-center"
          type="button"
          priority="tertiary"
          onClick={resendOtp}
        >
          Renvoyer un code
        </Button>
      </div>
    </div>
  );
};
