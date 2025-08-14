import { SyntheticEvent } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

export const PdfLink = ({
  url,
  text,
  title,
  className,
}: {
  url: string;
  text: string;
  title: string;
  className?: string;
}) => {
  const { accessToken } = useKeycloakContext();

  const getFileUrlFromBlob = async (): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

      xhr.onload = async function (_error) {
        if (this.status == 200) {
          try {
            const blob = new Blob([this.response], {
              type: xhr.getResponseHeader("content-type") || "",
            });
            const url = window.URL.createObjectURL(blob);

            resolve(url);

            return;
          } catch (error) {
            console.error(error);
          }

          resolve(undefined);

          return;
        }
        reject();
      };

      xhr.send();
    });
  };

  const handleClick = async (e: SyntheticEvent) => {
    e.preventDefault();
    const url = await getFileUrlFromBlob();
    const a = document.createElement("a");

    document.body.appendChild(a);

    a.href = url!;
    a.target = "_blank";
    a.download = "dossier_de_faisabilite.pdf";

    a.click();

    document.body.removeChild(a);

    setTimeout(function () {
      window.URL.revokeObjectURL(url!);
    }, 1000);
  };
  return (
    <div className="max-w-screen-md truncate">
      <a
        href="#"
        title={title}
        onClick={handleClick}
        className={className || ""}
      >
        {text}
      </a>
    </div>
  );
};
