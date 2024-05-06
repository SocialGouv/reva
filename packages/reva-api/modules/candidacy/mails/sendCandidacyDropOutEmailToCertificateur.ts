import mjml2html from "mjml";

import { prismaClient } from "../../../prisma/client";
import { sendGenericEmail, templateMail } from "../../shared/email";

const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

export const sendCandidacyDropOutEmailToCertificateur = async (
  candidacyId: string,
) => {
  const feasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
    include: {
      certificationAuthority: true,
      candidacy: { include: { candidate: true } },
    },
  });

  if (!feasibility) {
    return;
  }

  const {
    certificationAuthority: { contactEmail },
    candidacy: { candidate },
  } = feasibility;

  const candidateFullName =
    candidate &&
    `${candidate?.firstname || ""}${
      candidate?.lastname ? ` ${candidate?.lastname}` : ""
    }`;

  if (!contactEmail || !candidateFullName) {
    return;
  }

  const feasibilityUrl = `${baseUrl}/admin2/candidacies/${candidacyId}/feasibility`;

  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Nous vous informons que ${candidateFullName} a abandonné son parcours de VAE. Pour retrouver la candidature en question, cliquez sur le lien ci-dessous.</p>
      <p>L'équipe France VAE.</p>
    `,
      labelCTA: "Accéder à la candidature",
      url: feasibilityUrl,
    }),
  );

  return sendGenericEmail({
    to: { email: contactEmail },
    htmlContent: htmlContent.html,
    subject: "Une candidature a été abandonnée",
  });
};
