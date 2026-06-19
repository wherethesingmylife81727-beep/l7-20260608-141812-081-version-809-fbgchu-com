(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (!target || target.tagName !== 'IMG') {
            return;
        }

        var wrapper = target.closest('[data-image-fallback]');
        if (wrapper) {
            wrapper.classList.add('is-missing');
        }
    }, true);

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        if (!scopes.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get('q') || '';

        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-year-filter]');
            var region = scope.querySelector('[data-region-filter]');
            var category = scope.querySelector('[data-category-filter]');
            var empty = scope.querySelector('[data-filter-empty]');
            var container = scope.parentElement || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));

            if (input && urlQuery) {
                input.value = urlQuery;
            }

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var selectedYear = normalize(year ? year.value : '');
                var selectedRegion = normalize(region ? region.value : '');
                var selectedCategory = normalize(category ? category.value : '');
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags')
                    ].join(' '));

                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
                        matched = false;
                    }
                    if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedCategory && normalize(card.getAttribute('data-category')) !== selectedCategory) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visibleCount !== 0;
                }
            }

            [input, year, region, category].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });

            apply();
        });
    }

    function setStatus(status, message) {
        if (status) {
            status.textContent = message;
        }
    }

    function attachStream(video, source, status) {
        if (!video || !source) {
            setStatus(status, '没有可用播放源。');
            return;
        }

        if (video.__hlsInstance) {
            video.__hlsInstance.destroy();
            video.__hlsInstance = null;
        }

        setStatus(status, '正在初始化播放源...');

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            video.__hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setStatus(status, '播放源已就绪。');
                video.play().catch(function () {
                    setStatus(status, '播放源已就绪，请再次点击视频播放。');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    setStatus(status, '播放源初始化失败，请刷新页面或切换播放源。');
                }
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function onLoaded() {
                video.removeEventListener('loadedmetadata', onLoaded);
                setStatus(status, '播放源已就绪。');
                video.play().catch(function () {
                    setStatus(status, '播放源已就绪，请再次点击视频播放。');
                });
            });
            video.load();
            return;
        }

        video.src = source;
        video.load();
        video.play().then(function () {
            setStatus(status, '播放源已就绪。');
        }).catch(function () {
            setStatus(status, '当前浏览器可能需要 HLS 支持，请使用现代浏览器访问。');
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('.video-player');
            var overlay = shell.querySelector('[data-play-button]');
            var status = shell.querySelector('[data-player-status]');
            var sourceButtons = Array.prototype.slice.call(shell.querySelectorAll('[data-source-button]'));
            var currentSource = overlay ? overlay.getAttribute('data-play-source') : '';

            sourceButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    currentSource = button.getAttribute('data-source-url') || currentSource;
                    if (overlay) {
                        overlay.setAttribute('data-play-source', currentSource);
                        overlay.classList.remove('is-hidden');
                    }
                    sourceButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    if (video) {
                        video.pause();
                        video.removeAttribute('src');
                        video.load();
                    }
                    setStatus(status, '已切换播放源，点击播放按钮开始播放。');
                });
            });

            if (overlay && video) {
                overlay.addEventListener('click', function () {
                    currentSource = overlay.getAttribute('data-play-source') || currentSource || video.getAttribute('data-default-source');
                    overlay.classList.add('is-hidden');
                    attachStream(video, currentSource, status);
                });
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initPlayers();
    });
})();
