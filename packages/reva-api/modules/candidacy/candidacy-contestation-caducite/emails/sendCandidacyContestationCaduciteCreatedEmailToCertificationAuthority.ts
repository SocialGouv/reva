import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../../shared/email";

export const sendCandidacyContestationCaduciteCreatedEmailToCertificationAuthority =
  async ({
    candidateFullName,
    certificationAuthorityName,
    certificationAuthorityEmail,
  }: {
    candidateFullName: string;
    certificationAuthorityName: string;
    certificationAuthorityEmail: string;
  }) => {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
      <p>Bonjour ${certificationAuthorityName},</p>
      <p>Les candidats doivent s'actualiser sur leur compte France VAE tous les 6 mois. Sans actualisation de leur part, leur recevabilité n'est plus valable. En tant que certificateur, vous avez la possibilité de lever cette caducité si le candidat la conteste.</p>
      <p>${candidateFullName} souhaite contester la caducité de sa recevabilité.</p>
      <p>Vous trouverez dans votre espace les raisons de sa non-actualisation et pourrez décider si, oui ou non, vous souhaitez revenir sur le statut de sa recevabilité.</p>
      `,
          url,
          labelCTA: "Accéder à mon compte",
          bottomLine: `
      <p>Si vous avez besoin d'informations complémentaires ou de pièces justificatives, adressez-vous directement au candidat. Vous trouverez ses coordonnées dans votre espace.</p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE</p>
      <br/>
      <p><em>Procédure d'actualisation conforme aux dispositions de <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048699561">l'article R. 6412-4 du Code du travail</a> modifié par <a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000048679311">l'article 2 du décret n° 2023-1275 du 27 décembre 2023 relatif à la validation des acquis de l'expérience</a></em></p>
      `,
        }),
      );

    return sendEmailWithLink({
      to: { email: certificationAuthorityEmail },
      htmlContent,
      subject: "Un candidat conteste la caducité de sa recevabilité",
      app: "admin",
    });
  };
