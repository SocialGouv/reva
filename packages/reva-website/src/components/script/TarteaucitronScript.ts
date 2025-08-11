export const tarteaucitronScript = ({
  matomoUrl,
  produktlyClientToken,
}: {
  matomoUrl: string;
  produktlyClientToken?: string;
}) => `
    var script = document.createElement("script");

    var matomoServiceInit = function() {
      window.tarteaucitron.user.matomotmUrl = "${matomoUrl}";
      const tacJobs =  (window.tarteaucitron.job = window.tarteaucitron.job || []);
      tacJobs.push("matomotm");
      window.tarteaucitron.user.produktlyClientToken = "${produktlyClientToken}";
      tacJobs.push("produktly");
    };

    script.src = "/vendor/tarteaucitronjs/tarteaucitron.js";
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
