(function() {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
      body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  document.querySelectorAll('[data-card-scope]').forEach(function(scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var activeFilter = 'all';

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function(card) {
        var text = normalize(card.getAttribute('data-search'));
        var type = card.getAttribute('data-type') || '';
        var matchedText = !query || text.indexOf(query) !== -1;
        var matchedType = activeFilter === 'all' || type === activeFilter;
        card.classList.toggle('is-hidden', !(matchedText && matchedType));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    filters.forEach(function(button) {
      button.addEventListener('click', function() {
        activeFilter = button.getAttribute('data-filter-value') || 'all';
        filters.forEach(function(item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });
  });
})();
