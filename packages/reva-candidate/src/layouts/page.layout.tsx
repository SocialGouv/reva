"use client";

import Head from "next/head";
import { ReactNode } from "react";

import { BackToHomeButton } from "@/components/legacy/molecules/BackToHomeButton/BackToHomeButton";

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
      <Head>{title && <title>{title} - France VAE</title>}</Head>

      {displayBackToHome && <BackToHomeButton />}

      {children}
    </div>
  );
};
