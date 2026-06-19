(function () {
  var body = document.body;
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var query = input.value.trim();
      if (!query) {
        return;
      }
      event.preventDefault();
      var action = form.getAttribute('action') || './catalog.html';
      window.location.href = action + '?q=' + encodeURIComponent(query);
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var container = panel.parentElement;
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card-grid] > article'));
    var empty = container.querySelector('[data-filter-empty]');
    var keyword = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var genre = panel.querySelector('[data-filter-genre]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function apply() {
      var query = valueOf(keyword);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var genreValue = valueOf(genre);
      var visible = 0;

      cards.forEach(function (card) {
        var words = (card.getAttribute('data-keywords') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
        var match = true;

        if (query && words.indexOf(query) === -1) {
          match = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          match = false;
        }
        if (typeValue && cardType !== typeValue) {
          match = false;
        }
        if (yearValue && cardYear !== yearValue) {
          match = false;
        }
        if (genreValue && cardGenre.indexOf(genreValue) === -1) {
          match = false;
        }

        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (initialQuery && keyword) {
      keyword.value = initialQuery;
    }

    panel.addEventListener('input', apply);
    panel.addEventListener('change', apply);
    panel.addEventListener('reset', function () {
      window.setTimeout(apply, 0);
    });
    apply();
  });
})();
