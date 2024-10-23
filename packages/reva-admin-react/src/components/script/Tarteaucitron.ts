export const tarteaucitronScript = ({
  matomoUrl,
  crispID,
}: {
  matomoUrl: string;
  crispID: string;
}) => `
    var script = document.createElement("script");

    var matomoServiceInit = function() {
      window.tarteaucitron.user.matomotmUrl = "${matomoUrl}";
      (window.tarteaucitron.job = window.tarteaucitron.job || []).push("matomotm");
    };

    var crispServiceInit = function() {
      window.tarteaucitron.user.crispID = "${crispID}";
      (window.tarteaucitron.job = window.tarteaucitron.job || []).push("crisp");
    };

    script.src = "/admin2/vendor/tarteaucitronjs/tarteaucitron.js";
    script.onload = function () {
      if (typeof window !== "undefined") {
        window.tarteaucitron.init({
          useExternalCss: true,
          removeCredit: true,
          iconPosition: "BottomLeft",
        });
        matomoServiceInit();
        crispServiceInit();
      }
    };

    document.head.appendChild(script);
  `;
