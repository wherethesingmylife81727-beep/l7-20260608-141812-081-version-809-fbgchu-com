(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var stage = document.querySelector("[data-hero]");
    if (!stage) {
      return;
    }
    var slides = Array.prototype.slice.call(stage.querySelectorAll("[data-hero-slide]"));
    var thumbs = Array.prototype.slice.call(stage.querySelectorAll("[data-hero-thumb]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        start();
      });
    });

    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var search = panel.querySelector("[data-filter-search]");
      var genre = panel.querySelector("[data-filter-genre]");
      var region = panel.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function apply() {
        var q = normalize(search && search.value);
        var g = normalize(genre && genre.value);
        var r = normalize(region && region.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (g && normalize(card.getAttribute("data-genre")).indexOf(g) === -1) {
            ok = false;
          }
          if (r && normalize(card.getAttribute("data-region")).indexOf(r) === -1) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      }

      [search, genre, region].forEach(function (item) {
        if (item) {
          item.addEventListener("input", apply);
          item.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayer() {
    var video = document.querySelector("video[data-stream]");
    if (!video) {
      return;
    }
    var overlay = document.querySelector(".play-overlay");
    var stream = video.getAttribute("data-stream");
    var attached = false;

    function attach() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }
      video.src = stream;
    }

    function play() {
      attach();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
