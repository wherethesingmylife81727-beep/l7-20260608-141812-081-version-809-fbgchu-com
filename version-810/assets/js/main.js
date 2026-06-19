(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var previous = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle('is-active', position === index);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle('is-active', position === index);
        });
      }

      function move(step) {
        show(index + step);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          move(1);
        }, 5200);
      }

      if (previous) {
        previous.addEventListener('click', function () {
          move(-1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          move(1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      restart();
    }

    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      var current = { name: 'all', value: 'all' };

      function includesText(card, query) {
        var data = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        return data.indexOf(query) !== -1;
      }

      function matchesFilter(card) {
        if (current.name === 'all') {
          return true;
        }
        var value = card.getAttribute('data-' + current.name) || '';
        return value.indexOf(current.value) !== -1;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var visible = includesText(card, query) && matchesFilter(card);
          card.classList.toggle('is-hidden', !visible);
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
        input.addEventListener('input', apply);
      }

      panel.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
          current.name = button.getAttribute('data-filter') || 'all';
          current.value = button.getAttribute('data-value') || 'all';
          panel.querySelectorAll('[data-filter]').forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      apply();
    });
  });
})();
