import { Transition } from "framer-motion";

export const SMALL_TITLE_LENGTH = 76;

export const heightConfig = {
  small: "270px",
  medium: "553px",
  large: "100vh",
};

export const transitionIn: Transition = {
  type: "spring",
  duration: 0.5,
  bounce: 0.2,
};

export const transitionOut: Transition = {
  type: "spring",
  duration: 0.2,
  bounce: 0.1,
};

export const rounded2xl = {
  borderRadius: "24px",
};

export const roundedNone = {
  borderRadius: "0px",
};
