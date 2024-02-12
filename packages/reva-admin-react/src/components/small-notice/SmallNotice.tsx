import { HTMLAttributes, ReactNode } from "react";

interface Props {
  status?: "info" | "warning" | "success" | "error";
  children: ReactNode;
  filled?: boolean;
}

export const SmallNotice = (props: Props) => {
  const { status = "info", filled, children } = props;

  let containerClassName: HTMLAttributes<HTMLDivElement>["className"] = `text-[#0063CB] ${
    filled ? "bg-[#E8EDFF]" : "bg-white"
  }`;
  let iconClassName: HTMLAttributes<HTMLSpanElement>["className"] =
    "fr-icon-info-fill";

  if (status == "warning") {
    containerClassName = `text-[#716043] ${
      filled ? "bg-[#FEECC2]" : "bg-white"
    }`;
    iconClassName = "fr-icon-flashlight-fill";
  } else if (status == "success") {
    containerClassName = `text-[#18753C] ${
      filled ? "bg-[#B8FEC9]" : "bg-white"
    }`;
    iconClassName = "fr-icon-checkbox-circle-fill";
  } else if (status == "error") {
    containerClassName = `text-[#6E445A] ${
      filled ? "bg-[#FEE7FC]" : "bg-white"
    }`;
    iconClassName = "fr-icon-close-circle-fill";
  }

  return (
    <div>
      <div
        className={`${containerClassName} inline-flex items-center gap-1 rounded px-1`}
      >
        <span className={`fr-icon--sm ${iconClassName}`} />
        <label className={`text-sm ${filled ? "font-bold" : ""}`}>
          {children}
        </label>
      </div>
    </div>
  );
};
