import { BackButton, BasicBackButtonProps } from "../BackButton";

export const BackToHomeButton = (
  props: Omit<BasicBackButtonProps, "label" | "onClick">
) => <BackButton {...props} label="Revenir à l'accueil" />;
