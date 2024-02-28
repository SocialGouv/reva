export function initUserguiding(userguidingId) {
  // Elm needs the app to be the first child of the body element
  // This ensures that the Userguiding elements are inserted before the Elm app:
  const originalInsertBefore = Element.prototype.insertBefore;

  Element.prototype.insertBefore = function () {
    if (
      ["__userGuiding__preview_Root", "__ug__client__styled__root__"].includes(
        arguments[0].id,
      )
    ) {
      Element.prototype.appendChild.apply(this, arguments);
    } else {
      originalInsertBefore.apply(this, arguments);
    }
  };

  // The original Userguiding script:
  (function (g, u, i, d, e, s) {
    g[e] = g[e] || [];
    var f = u.getElementsByTagName(i)[0];
    var k = u.createElement(i);
    k.async = true;
    k.src =
      "https://static.userguiding.com/media/user-guiding-" + s + "-embedded.js";
    f.parentNode.insertBefore(k, f);
    if (g[d]) return;
    var ug = (g[d] = { q: [] });
    ug.c = function (n) {
      return function () {
        ug.q.push([n, arguments]);
      };
    };
    var m = [
      "previewGuide",
      "finishPreview",
      "track",
      "identify",
      "hideChecklist",
      "launchChecklist",
    ];
    for (var j = 0; j < m.length; j += 1) {
      ug[m[j]] = ug.c(m[j]);
    }
  })(
    window,
    document,
    "script",
    "userGuiding",
    "userGuidingLayer",
    userguidingId,
  );
}
