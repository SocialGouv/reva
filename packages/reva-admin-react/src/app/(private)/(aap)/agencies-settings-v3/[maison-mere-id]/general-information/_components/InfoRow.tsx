import { ReactNode } from "react";

export const InfoRow = ({
  label,
  badge,
  pendingValue,
  emphasis = "current",
  children,
  className,
}: {
  label: string;
  badge?: ReactNode;
  pendingValue?: ReactNode;
  emphasis?: "current" | "pending";
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center gap-6 border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey ${className || ""}`}
  >
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {badge}
    </div>
    <div className="flex-1 text-right">
      {pendingValue ? (
        <>
          <span
            className={
              emphasis === "current" ? "font-bold" : "text-neutral-400"
            }
          >
            {children}
          </span>
          <span className="mx-2 text-dsfrGray-mentionGrey">&rarr;</span>
          <span
            className={
              emphasis === "pending" ? "font-bold" : "text-neutral-400"
            }
          >
            {pendingValue}
          </span>
        </>
      ) : (
        <span className="font-bold">{children}</span>
      )}
    </div>
  </div>
);
