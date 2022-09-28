import { AnimatePresence, motion } from "framer-motion";
import { FC } from "react";

import certificationImg from "../../../components/organisms/Card/certification.png";
import { Page } from "../Page";

interface Props {
  direction: "initial" | "next" | "previous";
}

export const ProgressPage: FC<Props> = ({ direction, children }) => {
  return (
    <Page className="z-50 flex flex-col bg-neutral-100" direction={direction}>
      <AnimatePresence>
        <motion.div
          key="home-screen"
          className="flex flex-col h-full relative overflow-hidden"
          initial={direction === "next" ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        >
          <img
            className="pointer-events-none"
            alt=""
            role="presentation"
            style={{
              position: "absolute",
              left: "-53px",
              top: "58px",
              width: "106px",
            }}
            src={certificationImg}
          />
          <h1 className="mt-12 -mb-12 text-center font-bold">Reva</h1>
          <div className="grow overflow-y-auto mt-36 px-8 pb-8">{children}</div>
        </motion.div>
      </AnimatePresence>
    </Page>
  );
};
