import { SyntheticEvent } from "react";

const getFileUrlFromBlob = async (
  url: string,
  accessToken: string,
): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    xhr.onload = async function () {
      if (this.status === 200) {
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

const getFileUrl = async (
  url: string,
  accessToken: string,
): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    xhr.onload = async function () {
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

export const handleAuthenticatedDownload = async (
  url: string,
  accessToken: string,
  e: SyntheticEvent,
) => {
  e.preventDefault();
  let fileUrl = await getFileUrl(url, accessToken);
  if (!fileUrl) {
    fileUrl = await getFileUrlFromBlob(url, accessToken);
  }
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.href = fileUrl!;
  a.target = "_blank";
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(fileUrl!);
  }, 250);
};
