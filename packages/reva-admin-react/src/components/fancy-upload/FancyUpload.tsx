import {
  ReactNode,
  DetailedHTMLProps,
  InputHTMLAttributes,
  useState,
} from "react";

import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { Upload } from "@codegouvfr/react-dsfr/Upload";

import { FancyPreview } from "../fancy-preview/FancyPreview";

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
}) => {
  const [files, setFiles] = useState<FileList | null>();

  const mappedFiles: File[] = [];

  if (files) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      mappedFiles.push(file);
    }
  }

  return (
    <div className={`${className || ""}`}>
      <Upload
        className={`border bg-dsfr-light-neutral-grey-1000 p-8`}
        label={
          <>
            <span className="text-2xl font-bold">{title}</span>
            <CallOut
              className="ml-8 my-4 py-0 bg-transparent"
              classes={{
                text: "text-sm leading-6 ",
              }}
            >
              {description}
            </CallOut>
          </>
        }
        hint={hint}
        nativeInputProps={{
          ...nativeInputProps,
          onChange: (e) => {
            setFiles(e.target.files);

            nativeInputProps?.onChange?.(e);
          },
        }}
        state={state}
        stateRelatedMessage={stateRelatedMessage}
      />
      {mappedFiles.map((file) => (
        <FancyPreview
          key={file.name}
          title={title}
          name={file.name}
          src={URL.createObjectURL(file)}
        />
      ))}
    </div>
  );
};
