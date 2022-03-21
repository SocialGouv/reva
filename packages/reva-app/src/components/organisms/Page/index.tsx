import { motion } from "framer-motion";

interface PageConfig {
  children: JSX.Element[];
  className: string;
  navigation: Navigation;
}

export type Page =
  | "show-results"
  | "show-certificate-details"
  | "load-submission";

export type Direction = "previous" | "next";

export type Navigation = { direction: Direction; page: Page };

const pageVariants = {
  enter: (direction: Direction) => ({
    x: direction === "previous" ? -100 : "100%",
  }),
  visible: { x: 0 },
  exit: (direction: Direction) => ({
    x: direction === "previous" ? "100%" : -100,
  }),
};

const pageTransition = { ease: "easeOut", duration: 0.2 };

export const Page = ({ children, className, navigation }: PageConfig) => {
  return (
    <motion.div
      custom={navigation.direction}
      variants={pageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={pageTransition}
      layoutScroll
      className={`absolute inset-0 ${className}`}
    >
      {children}
    </motion.div>
  );
};
