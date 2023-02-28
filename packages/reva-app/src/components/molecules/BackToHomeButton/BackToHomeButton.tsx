import { BackButton, BackButtonProps } from "../BackButton";

export const BackToHomeButton = (props: Omit<BackButtonProps, "label">) => (
  <BackButton {...props} label="Revenir à l'accueil" />
);
