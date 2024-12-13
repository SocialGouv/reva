import { Banner } from "./Banner";

export const ContestationCaduciteConfirmedBanner = () => (
  <div className="my-14" data-test="contestation-caducite-confirmed-banner">
    <Banner
      description="Après étude de votre contestation, le certificateur a décidé que votre recevabilité n'était plus valable. Cela signifie que votre parcours VAE s'arrête ici."
      imageSrc="/candidat/images/image-warning-hand.png"
      imgAlt="Main levée en signe d'avertissement"
    />
  </div>
);
