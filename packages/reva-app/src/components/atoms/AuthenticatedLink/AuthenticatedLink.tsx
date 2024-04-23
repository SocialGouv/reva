import { Download } from "@codegouvfr/react-dsfr/Download";
import { useKeycloakContext } from "contexts/keycloakContext";
import { SyntheticEvent } from "react";

export const AuthenticatedLink = ({
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
  const context = useKeycloakContext();
  const accessToken = context?.token;

  const getFileUrlFromBlob = async (): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

      xhr.onload = async function (e) {
        if (this.status === 200) {
          try {
            var blob = new Blob([this.response], {
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

      xhr.onload = async function (e) {
        if (this.status === 200) {
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
    let url = await getFileUrl();
    if (!url) {
      url = await getFileUrlFromBlob();
    }
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url!;
    a.target = "_blank";
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url!);
    }, 250);
  };

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Download
      details="PDF"
      label={text}
      className={className}
      linkProps={{
        onClick: handleClick,
        title: title,
        href: "",
      }}
    />
  );
};
