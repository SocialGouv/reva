import { motion } from "framer-motion";

interface PageConfig {
  children: JSX.Element | JSX.Element[];
  className: string;
  navigation: Navigation;
}

export type Page = "show-results" | "show-certificate-details" | "project-home";

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

const pageTransition = { ease: "circOut", duration: 0.35 };

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
      className={`will-change-transform absolute inset-0 ${className}`}
    >
      {children}
    </motion.div>
  );
};
