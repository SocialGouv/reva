import { Transition } from "framer-motion";

export const SMALL_TITLE_LENGTH = 94;

export const heightConfig = {
  small: "270px",
  medium: "553px",
  large: "100vh",
};

export const transitionIn: Transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0.2,
};

export const transitionOut: Transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0.1,
};

export const rounded2xl = {
  borderRadius: "24px",
};

export const roundedNone = {
  borderRadius: "0px",
};
