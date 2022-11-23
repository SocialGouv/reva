import { FC } from "react";

interface Props {
  firstname: string;
  email: string;
}

export const CandidacyDismissed: FC<Props> = ({ firstname, email }) => {
  return (
    <div className="py-12 px-12">
      <h1 className="text-4xl font-extrabold pt-12">Bonjour {firstname},</h1>
      <h2 className="font-bold mb-2 text-xl py-6">Email : {email}</h2>
      <section className="text-slate-600 text-lg">
        <div className="my-2">
          Nous avons enregistré l'interruption de votre parcours. Nous vous
          informons que vous ne pourrez pas candidater à nouveau dans le cadre
          de cette expérimentation.
        </div>
        <div className="my-2">
          <span>Vous avez une question ?</span>
          <a className="ml-2 " href="mailto:support@reva.beta.gouv.fr">
            support@reva.beta.gouv.fr
          </a>
        </div>
      </section>
    </div>
  );
};
