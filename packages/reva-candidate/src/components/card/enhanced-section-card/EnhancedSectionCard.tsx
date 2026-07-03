"use client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

import { BadgeCompleted } from "@/components/badge/badge-completed/BadgeCompleted";
import { BadgeToComplete } from "@/components/badge/badge-to-complete/BadgeToComplete";
import { SectionCard } from "@/components/card/section-card/SectionCard";

export const EnhancedSectionCard = ({
  title,
  titleIconClass,
  status,
  isEditable = false,
  disabled = false,
  buttonOnClickHref,
  children,
  CustomBadge,
  customButtonTitle,
  "data-testid": dataTest,
}: {
  title: string;
  titleIconClass?: string;
  status?: "TO_COMPLETE" | "COMPLETED";
  isEditable?: boolean;
  disabled?: boolean;
  buttonOnClickHref?: string;
  children?: ReactNode;
  CustomBadge?: ReactNode;
  customButtonTitle?: string;
  "data-testid"?: string;
}) => {
  const router = useRouter();

  const badge =
    CustomBadge ||
    (status === "TO_COMPLETE" && <BadgeToComplete />) ||
    (status === "COMPLETED" && <BadgeCompleted />) ||
    null;
  const buttonTitle =
    customButtonTitle || (status === "TO_COMPLETE" ? "Compléter" : "Modifier");

  if (isEditable && buttonOnClickHref) {
    return (
      <SectionCard
        data-testid={dataTest}
        title={title}
        titleIconClass={titleIconClass}
        badge={badge}
        disabled={disabled}
        hasButton
        buttonPriority={status === "TO_COMPLETE" ? "primary" : "secondary"}
        buttonTitle={buttonTitle}
        buttonOnClick={() => router.push(buttonOnClickHref)}
      >
        {children}
      </SectionCard>
    );
  }

  if (isEditable) {
    return (
      <SectionCard
        data-testid={dataTest}
        title={title}
        titleIconClass={titleIconClass}
        badge={badge}
        disabled={disabled}
      >
        {children}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      data-testid={dataTest}
      title={title}
      titleIconClass={titleIconClass}
      hasButton={false}
      disabled={disabled}
    >
      {children}
    </SectionCard>
  );
};
