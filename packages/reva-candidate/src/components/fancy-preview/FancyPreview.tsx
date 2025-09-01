import { useState } from "react";

interface Props {
  title: string;
  name: string;
  src: string;
  defaultDisplay?: boolean;
  showFileName?: boolean;
  transparentBg?: boolean;
}

export const FancyPreview = (props: Props) => {
  const {
    title,
    name,
    src,
    defaultDisplay = true,
    showFileName = true,
    transparentBg = true,
  } = props;

  const [display, setDisplay] = useState<boolean>(defaultDisplay);

  const backgroundColor = display
    ? "bg-[#E3E3FD]"
    : transparentBg
      ? "bg-transparent"
      : "bg-dsfrGray-50";

  return (
    <div
      className={`flex flex-col gap-4 first:border-t border-gray-200 border-b ${transparentBg ? "" : "border-x"}`}
      data-test={`feasibility-files-preview-${title}`}
    >
      <div
        className={`flex flex-row items-center justify-between px-4 py-3 cursor-pointer ${backgroundColor}`}
        onClick={() => setDisplay(!display)}
      >
        <label className="text-blue-800 font-medium cursor-pointer">
          {showFileName
            ? title
            : display
              ? "Masquer la piece jointe"
              : "Voir la piece jointe"}
        </label>
        <span
          className={`text-blue-800 fr-icon--sm ${display ? "fr-icon-eye-off-fill" : "fr-icon-eye-fill"}`}
          aria-hidden="true"
        />
      </div>
      {display && (
        <iframe
          className="w-full h-[500px] px-4"
          title={title}
          name={name}
          src={src}
        />
      )}
    </div>
  );
};
