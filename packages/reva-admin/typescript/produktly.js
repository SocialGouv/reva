export function initProduktly(produktlyClientToken) {
  // Elm needs the app to be the first child of the body element
  // This ensures that the Produktly elements are inserted after the Elm app:
  const originalPrepend = Element.prototype.prepend;

  Element.prototype.prepend = function () {
    if (
      [
        "produktly-sticky-top-of-body-portal-root",
        "produktly-top-of-body-portal-root",
      ].includes(arguments[0].id)
    ) {
      Element.prototype.appendChild.apply(this, arguments);
    } else {
      originalPrepend.apply(this, arguments);
    }
  };

  (function (w, d, f) {
    var a = d.getElementsByTagName("head")[0];
    var s = d.createElement("script");
    s.async = 1;
    s.src = f;
    s.setAttribute("id", "produktlyScript");
    s.dataset.clientToken = produktlyClientToken;
    a.appendChild(s);
  })(window, document, "https://public.produktly.com/js/main.js");
}
