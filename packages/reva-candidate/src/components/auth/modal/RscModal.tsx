import { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import cn from "classnames";
import { ReactNode } from "react";

type ModalProps = {
  title: ReactNode;
  className?: string;
  children: ReactNode;
  iconId?: FrIconClassName | RiIconClassName;
  size?: "small" | "medium" | "large";
};

export default function RscModal({
  title,
  className,
  children,
  iconId,
  size = "medium",
}: ModalProps) {
  return (
    <dialog
      role="dialog"
      className={cn("border-none bg-neutral-700/80 z-[1975] p-0 m-0 w-screen h-screen top-0 right-0 bottom-0 left-0 absolute transition-all", className)}
      open
    >
      <div className="fr-container fr-container--fluid fr-container-md h-full flex flex-col justify-center ">
        <form method="dialog">
          <div className="fr-grid-row fr-grid-row--center">
            <div className={
              cn("fr-col-12", 
                {
                  "fr-col-md-6 fr-col-lg-4": size === "small",
                  "fr-col-md-8 fr-col-lg-6": size === "medium",
                  "fr-col-md-10 fr-col-lg-8": size === "large",
                }
              )
            }>
              <div className="fr-modal__body">
                <div className="fr-modal__header">
                  <button
                    className="fr-btn--close fr-btn"
                    type="submit"
                  >
                    Fermer
                  </button>
                </div>
                <div className="fr-modal__content">
                  <h1 className="fr-modal__title">
                    {iconId !== undefined && (
                      <span className={cn(iconId, "fr-fi--lg")} />
                    )}
                    {title}
                  </h1>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}
