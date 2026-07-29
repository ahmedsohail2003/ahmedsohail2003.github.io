/* Deep-dive page engine:
   1) renders inline <script type="text/markdown"> blocks in place;
   2) fetches each [data-readme] repo's README from raw.githubusercontent,
      renders it, and rewrites relative links/images to the repo's GitHub
      blob/raw URLs so nothing 404s. The READMEs are embedded live so this
      site can never drift out of sync with the repositories. */
(function () {
  function renderInline() {
    document.querySelectorAll('script[type="text/markdown"]').forEach(function (s) {
      var div = document.createElement("div");
      div.className = "md";
      div.innerHTML = marked.parse(s.textContent);
      s.parentNode.replaceChild(div, s);
    });
  }

  function absolutize(container, repo) {
    var blob = "https://github.com/ahmedsohail2003/" + repo + "/blob/master/";
    var raw = "https://raw.githubusercontent.com/ahmedsohail2003/" + repo + "/master/";
    container.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (/^(https?:|#|mailto:)/.test(h)) return;
      a.setAttribute("href", blob + h.replace(/^\.\//, ""));
    });
    container.querySelectorAll("img[src]").forEach(function (img) {
      var s = img.getAttribute("src");
      if (/^https?:/.test(s)) return;
      img.setAttribute("src", raw + s.replace(/^\.\//, ""));
      img.setAttribute("loading", "lazy");
    });
  }

  function embedReadmes() {
    document.querySelectorAll("[data-readme]").forEach(function (box) {
      var repo = box.getAttribute("data-readme");
      var body = box.querySelector(".rb-body");
      fetch("https://raw.githubusercontent.com/ahmedsohail2003/" + repo + "/master/README.md")
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (md) {
          body.className = "rb-body md";
          body.innerHTML = marked.parse(md);
          absolutize(body, repo);
        })
        .catch(function () {
          body.innerHTML = '<p>Could not load the README here — read it directly on ' +
            '<a href="https://github.com/ahmedsohail2003/' + repo + '">GitHub</a>.</p>';
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderInline();
    embedReadmes();
  });
})();
