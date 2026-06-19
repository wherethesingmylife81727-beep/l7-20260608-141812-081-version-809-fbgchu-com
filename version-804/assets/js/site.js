(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function uniqueSorted(values) {
    return values
      .filter(Boolean)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index;
      })
      .sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-CN');
      });
  }

  function setupFilters() {
    var panels = queryAll('.filter-panel');
    panels.forEach(function (panel) {
      var block = panel.parentElement;
      var list = block ? block.parentElement.querySelector('[data-card-list]') : document.querySelector('[data-card-list]');
      if (!list) {
        list = document.querySelector('[data-card-list]');
      }
      var cards = queryAll('[data-search]', list || document);
      var input = panel.querySelector('.js-search');
      var yearSelect = panel.querySelector('.js-year-filter');
      var typeSelect = panel.querySelector('.js-type-filter');
      var result = panel.querySelector('[data-result-count]');

      if (yearSelect) {
        uniqueSorted(cards.map(function (card) {
          return card.getAttribute('data-year');
        })).forEach(function (year) {
          var option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
      }

      if (typeSelect) {
        uniqueSorted(cards.map(function (card) {
          return card.getAttribute('data-type');
        })).forEach(function (type) {
          var option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          typeSelect.appendChild(option);
        });
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }

          card.classList.toggle('is-hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '正在显示 ' + visible + ' / ' + cards.length + ' 条内容';
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupImageFallbacks() {
    queryAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing-image');
        if (image.parentElement) {
          image.parentElement.classList.add('is-missing-image');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupImageFallbacks();
  });
}());
