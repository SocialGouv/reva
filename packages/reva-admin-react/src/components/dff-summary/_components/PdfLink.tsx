import Button from "@codegouvfr/react-dsfr/Button";
import { SyntheticEvent } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

export const PdfLink = ({
  url,
  isBlobUrl,
  fileName,
}: {
  url: string;
  isBlobUrl?: boolean;
  fileName?: string;
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

  const getFileUrl = async (): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

      xhr.onload = async function (_error) {
        if (this.status == 200) {
          try {
            const json = JSON.parse(this.responseText);
            const url = json.url;

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

    const url = isBlobUrl ? await getFileUrlFromBlob() : await getFileUrl();

    const a = document.createElement("a");

    document.body.appendChild(a);

    a.href = url!;
    a.target = "_blank";
    a.download = fileName || "document_sans_nom";

    a.click();

    document.body.removeChild(a);

    setTimeout(function () {
      window.URL.revokeObjectURL(url!);
    }, 1000);
  };

  return (
    <Button
      onClick={handleClick}
      priority="tertiary no outline"
      size="small"
      iconId="fr-icon-file-download-line"
    >
      Télécharger en PDF
    </Button>
  );
};
