class AuthenticatedLinkElement extends HTMLElement {
  private _params: {
    url: string;
    text: string;
    token: string;
    title: string;
    class: string;
  } = { class: "", text: "", title: "", token: "", url: "" };

  get params() {
    return this._params;
  }

  set params(value) {
    this._params = value;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    const link = document.createElement("a");
    link.onclick = async () => {
      let url = await this.getFileUrl();
      if (!url) {
        url = await this.getFileUrlFromBlob();
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
    link.href = "#";
    link.title = this.params.title;
    link.className = this.params.class;
    link.appendChild(document.createTextNode(this.params.text));

    this.parentNode?.appendChild(link);
  }

  getFileUrlFromBlob(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.params.url);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Authorization", "Bearer " + this.params.token);

      xhr.onload = async function (e) {
        if (this.status == 200) {
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
  }

  getFileUrl(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.params.url);
      xhr.setRequestHeader("Authorization", "Bearer " + this.params.token);

      xhr.onload = async function (e) {
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
  }
}

export default {
  name: "authenticated-link",
  clazz: AuthenticatedLinkElement,
};
