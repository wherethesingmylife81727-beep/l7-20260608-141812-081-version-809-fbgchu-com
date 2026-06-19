(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function startTimer() {
                clearInterval(timer);
                timer = setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }

            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");

            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    startTimer();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10));
                    startTimer();
                });
            });

            showSlide(0);
            startTimer();
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");
            var regionSelect = scope.querySelector("[data-region-select]");
            var typeSelect = scope.querySelector("[data-type-select]");
            var tagButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-tag-filter]"));
            var activeTag = "";

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var region = regionSelect ? regionSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();

                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !region || card.getAttribute("data-region") === region;
                    var matchesType = !type || card.getAttribute("data-type") === type;
                    var matchesTag = !activeTag || (card.getAttribute("data-tags") || "").indexOf(activeTag) !== -1;
                    var show = matchesQuery && matchesRegion && matchesType && matchesTag;

                    card.style.display = show ? "" : "none";

                    if (show) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visibleCount ? "none" : "block";
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);

                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");

                if (query) {
                    input.value = query;
                }
            }

            if (regionSelect) {
                regionSelect.addEventListener("change", applyFilter);
            }

            if (typeSelect) {
                typeSelect.addEventListener("change", applyFilter);
            }

            tagButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeTag = button.getAttribute("data-tag-filter") || "";

                    tagButtons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });

                    applyFilter();
                });
            });

            applyFilter();
        });
    });
})();
