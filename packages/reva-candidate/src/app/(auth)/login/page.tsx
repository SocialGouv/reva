import Link from "next/link";

import { Input } from "@codegouvfr/react-dsfr/Input";
import { PageLayout } from "@/layouts/page.layout";
import { doLogin } from "./login.actions";
import SubmitButton from "@/components/forms/SubmitButton";

export default function Login() {
  return (
    <PageLayout title="Connexion" data-test="login-home">
      <h1 className="text-3xl font-bold text-dsfrBlue-500 mb-0">
        Bienvenue <span aria-hidden="true">🤝</span>,
      </h1>

      <div className="mb-6 max-w-xl">
        <h2 className="my-6">Connexion</h2>
        <p className="mb-10">
          Pour la sécurité de vos données, merci de renseigner votre email, un
          lien vous sera envoyé afin de retrouver votre candidature.
        </p>
      </div>

      <form action={doLogin} className="mb-6 max-w-xl">
        <Input
          hintText="Format attendu : nom@domaine.fr"
          nativeInputProps={{
            id: "email",
            name: "email",
            required: true,
            type: "email",
            autoComplete: "email",
            spellCheck: "false",
          }}
          label="Email"
        />
        <SubmitButton label="Me connecter" />
      </form>

      <div className="border-t border-gray-200 pt-6">
        <Link href="/registration" className="text-gray-500">Je n’ai pas de candidature</Link>
      </div>
    </PageLayout>
  );
}
