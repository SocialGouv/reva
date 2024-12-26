import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendNewCertificationAvailableToCertificationRegistryManagerEmail =
  async ({ email }: { email: string }) => {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
             Bonjour,
             <p>Vous avez fait la demande d’ajout d’une certification auprès de France VAE. Celle-ci est désormais disponible dans 
             votre espace et attend votre validation : </p>
             `,
          labelCTA: "Voir les certifications à valider",
          url,
          bottomLine:
            "Nous vous invitons à apporter les modifications en vue de sa mise en conformité et à le renvoyer au certificateur dans les meilleurs délais.",
        }),
      );

    return sendEmailWithLink({
      to: { email },
      app: "admin",
      htmlContent,
      customUrl: "/responsable-certifications/certifications",
      subject:
        "Une nouvelle certification a été ajoutée et attend votre validation ",
    });
  };
