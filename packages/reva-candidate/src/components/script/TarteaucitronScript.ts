export const tarteaucitronScript = ({ matomoUrl }: { matomoUrl: string }) => `
    var script = document.createElement("script");

    var matomoServiceInit = function() {
      window.tarteaucitron.user.matomotmUrl = "${matomoUrl}";
      (window.tarteaucitron.job = window.tarteaucitron.job || []).push("matomotm");
    };

    script.src = "/candidat/vendor/tarteaucitronjs/tarteaucitron.js";
    script.onload = function () {
      if (typeof window !== "undefined") {
        window.tarteaucitron.init({
          useExternalCss: true,
          removeCredit: true,
          iconPosition: "BottomLeft",
        });
        matomoServiceInit();
      }
    };

    document.head.appendChild(script);
  `;
