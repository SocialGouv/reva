import { FC } from "react";

interface Props {
  firstname: string;
  email: string;
}

export const CandidacyDismissed: FC<Props> = ({firstname, email}) => {
  return (
    <div>
      <h1>Bonjour {firstname},</h1>
      <h2>Email : {email}</h2>
      <p>
        Nous avons enregistré l'interruption de votre parcours. Nous vous
        informons que vous ne pourrez pas candidater à nouveau dans le cadre de
        cette expérimentation. Vous avez une question ?
        <a href="mailto:support@reva.beta.gouv.fr">support@reva.beta.gouv.fr</a> 
      </p>
    </div>
  );
};
