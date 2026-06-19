(function () {
  var body = document.body;
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      body.classList.toggle('is-menu-open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }
    restartHero();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter(input, chipValue) {
    var section = input.closest('section') || document;
    var grid = section.querySelector('.js-card-grid');
    var empty = section.querySelector('[data-empty-state]');
    if (!grid) {
      return;
    }
    var keyword = normalize(input.value || chipValue || '');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-local-search')).forEach(function (input) {
    input.addEventListener('input', function () {
      var section = input.closest('section') || document;
      Array.prototype.slice.call(section.querySelectorAll('[data-filter-chip]')).forEach(function (chip) {
        chip.classList.remove('is-active');
      });
      runFilter(input, '');
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      var section = chip.closest('section') || document;
      var input = section.querySelector('.js-local-search');
      var active = chip.classList.toggle('is-active');
      Array.prototype.slice.call(section.querySelectorAll('[data-filter-chip]')).forEach(function (item) {
        if (item !== chip) {
          item.classList.remove('is-active');
        }
      });
      if (input) {
        input.value = active ? chip.textContent : '';
        runFilter(input, input.value);
      }
    });
  });

  var urlParams = new URLSearchParams(window.location.search);
  var q = urlParams.get('q');
  var searchInput = document.getElementById('site-search-input');
  if (q && searchInput) {
    searchInput.value = q;
    runFilter(searchInput, q);
  }
})();
