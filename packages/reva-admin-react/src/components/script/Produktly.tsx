import { PRODUKTLY_CLIENT_TOKEN } from "@/config/config";
import Script from "next/script";

export const Produktly = () => (
  <Script id="init-produktly">
    {`(function (w, d, f) {
  var a = d.getElementsByTagName('head')[0];
  var s = d.createElement('script');
  s.async = 1;
  s.src = f;
  s.setAttribute('id', 'produktlyScript');
  s.dataset.clientToken = "${PRODUKTLY_CLIENT_TOKEN}";
  a.appendChild(s);
})(window, document, "https://public.produktly.com/js/main.js");`}
  </Script>
);
