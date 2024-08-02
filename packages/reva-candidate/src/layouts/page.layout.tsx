"use client";

import { BackToHomeButton } from "@/components/legacy/molecules/BackToHomeButton/BackToHomeButton";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
  title?: string;
  displayBackToHome?: boolean;
  "data-test"?: string;
}

export const PageLayout = ({
  title,
  children,
  className,
  displayBackToHome,
  ...props
}: Props) => {
  return (
    <div className={`flex-1 ${className || ""}`} data-test={props["data-test"]}>
      {title && <title>{title} - France VAE</title>}

      {displayBackToHome && <BackToHomeButton />}

      {children}
    </div>
  );
};
