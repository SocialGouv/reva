import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from "react";
export const FancyUpload = ({
  title,
  description,
  hint,
  className,
  nativeInputProps,
  state,
  stateRelatedMessage,
}: {
  title: string;
  description: ReactNode;
  hint?: string;
  className?: string;
  nativeInputProps?: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  state?: "error" | "success" | "default";
  stateRelatedMessage?: ReactNode;
}) => (
  <Upload
    className={`border bg-dsfrGray-contrast p-8 ${className || ""}`}
    label={
      <>
        <span className="text-2xl font-bold">{title}</span>
        <CallOut
          className="!ml-8 !my-4 !py-0 !bg-transparent"
          classes={{
            text: "text-sm leading-6 ",
          }}
        >
          {description}
        </CallOut>
      </>
    }
    hint={hint}
    nativeInputProps={nativeInputProps}
    state={state}
    stateRelatedMessage={stateRelatedMessage}
  />
);
