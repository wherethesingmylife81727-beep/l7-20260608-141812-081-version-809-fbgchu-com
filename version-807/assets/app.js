(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-filter-year]");
            var genre = scope.querySelector("[data-filter-genre]");
            var empty = scope.querySelector("[data-filter-empty]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function update() {
                var query = normalize(input ? input.value : "");
                var yearValue = normalize(year ? year.value : "");
                var genreValue = normalize(genre ? genre.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region")
                    ].join(" "));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardGenre = normalize(card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (genreValue && cardGenre.indexOf(genreValue) === -1) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, year, genre].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", update);
                    element.addEventListener("change", update);
                }
            });
        });
    });

    window.HDPlayer = {
        init: function (videoId, buttonId, source) {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var attached = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    attached = true;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    attached = true;
                    return;
                }

                video.src = source;
                attached = true;
            }

            function start() {
                attach();
                video.controls = true;
                if (button) {
                    button.classList.add("is-hidden");
                }
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }

            video.addEventListener("click", function () {
                if (!attached) {
                    start();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };
})();
