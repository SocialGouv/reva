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
    let xhr = new XMLHttpRequest();
    xhr.open("GET", this.params.url);
    xhr.setRequestHeader("Authorization", "Bearer " + this.params.token);

    xhr.onload = async function (e) {
      if (this.status == 200) {
        let url: string;

        try {
          // Using Signed Url
          const json = JSON.parse(this.responseText);
          url = json.url;
        } catch (error) {
          // Using Blobd
          var blob = new Blob([this.response], {
            type: xhr.getResponseHeader("content-type") || "",
          });
          url = window.URL.createObjectURL(blob);
        }

        let a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.target = "_blank";
        a.click();
        setTimeout(function () {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 250);
      }
    };

    const link = document.createElement("a");
    link.onclick = () => xhr.send();
    link.href = "#";
    link.title = this.params.title;
    link.className = this.params.class;
    link.appendChild(document.createTextNode(this.params.text));

    this.parentNode?.appendChild(link);
  }
}

export default {
  name: "authenticated-link",
  clazz: AuthenticatedLinkElement,
};
