"use client";

import { BackToHomeButton } from "@/components/legacy/molecules/BackToHomeButton/BackToHomeButton";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
  title?: string;
  displayBackToHome?: boolean;
}

export const PageLayout = ({
  title,
  children,
  className,
  displayBackToHome,
}: Props) => {
  return (
    <div className={`flex-1 ${className || ""}`}>
      {title && <title>{title} - France VAE</title>}

      {displayBackToHome && <BackToHomeButton />}

      {children}
    </div>
  );
};
