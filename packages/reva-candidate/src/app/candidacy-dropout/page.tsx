import Image from "next/image";

export default function CandidacyDropOutPage() {
  return (
    <div className="flex flex-col md:pl-16" data-test="candidacy-dropout-page">
      <Image
        className="fr-footer__logo mx-auto mb-8"
        width="225"
        height="138"
        src="/candidat/fvae_logo.svg"
        alt="France VAE"
      />
      <h1 className="text-dsfrBlue-500">
        Votre accompagnateur a déclaré votre abandon de candidature
      </h1>
      <p>
        Nous vous informons que, dans le cadre de votre parcours de VAE, votre
        conseiller a placé votre candidature en abandon.
      </p>
      <p>
        Si vous souhaitez contester cette décision veuillez nous contacter
        rapidement sur le mail support@vae.gouv.fr.
      </p>
      <p>L’équipe France VAE</p>
    </div>
  );
}
