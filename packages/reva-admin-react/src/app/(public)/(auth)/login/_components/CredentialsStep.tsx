import { Input } from "@codegouvfr/react-dsfr/Input";
import Link from "next/link";

import { PasswordInput } from "@/components/password-input/PasswordInput";

export const CredentialsStep = ({
  defaultEmail,
  passwordError,
}: {
  defaultEmail: string;
  passwordError?: string;
}) => (
  <>
    <Input
      className="mb-0"
      hintText="Format attendu : nom@domaine.fr"
      nativeInputProps={{
        id: "email",
        name: "email",
        required: true,
        type: "email",
        autoComplete: "username",
        spellCheck: "false",
        defaultValue: defaultEmail,
      }}
      label="Identifiant"
    />

    <PasswordInput
      state={passwordError ? "error" : "default"}
      stateRelatedMessage={passwordError}
    />
    <Link href="/forgot-password" className="fr-link mr-auto">
      Mot de passe oublié ?
    </Link>
  </>
);
