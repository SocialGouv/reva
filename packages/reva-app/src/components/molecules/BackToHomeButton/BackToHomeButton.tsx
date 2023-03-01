import { BackButton, BasicBackButtonProps } from "../BackButton";

export const BackToHomeButton = (
  props: Omit<BasicBackButtonProps, "label">
) => <BackButton {...props} label="Revenir à l'accueil" />;
