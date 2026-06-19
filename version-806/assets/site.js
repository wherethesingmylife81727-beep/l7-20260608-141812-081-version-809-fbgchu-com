(function () {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    const searchInput = document.querySelector('[data-search-input]');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-button]'));
    const cards = Array.from(document.querySelectorAll('.searchable-card'));
    let activeFilter = {
        field: 'all',
        value: 'all'
    };

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardMatchesFilter(card) {
        if (activeFilter.field === 'all') {
            return true;
        }

        const value = card.getAttribute('data-' + activeFilter.field) || '';
        return value.indexOf(activeFilter.value) !== -1;
    }

    function cardMatchesSearch(card) {
        const keyword = normalize(searchInput ? searchInput.value : '');
        if (!keyword) {
            return true;
        }

        const haystack = normalize(card.getAttribute('data-search'));
        return haystack.indexOf(keyword) !== -1;
    }

    function applyFilters() {
        cards.forEach(function (card) {
            const visible = cardMatchesFilter(card) && cardMatchesSearch(card);
            card.classList.toggle('hidden-by-filter', !visible);
        });
    }

    if (searchInput && cards.length) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (filterButtons.length && cards.length) {
        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove('active');
                });

                button.classList.add('active');
                activeFilter = {
                    field: button.getAttribute('data-filter-field') || 'all',
                    value: button.getAttribute('data-filter-value') || 'all'
                };

                applyFilters();
            });
        });
    }
})();

function setupMoviePlayer(videoId, overlayId, source) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    let loaded = false;
    let hls = null;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function beginPlayback() {
        loadSource();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            beginPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('emptied', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        loaded = false;
    });
}
