function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var startButton = document.querySelector("[data-player-start]");
    var message = document.querySelector("[data-player-message]");
    var attached = false;
    var hlsInstance = null;

    function showMessage(text) {
        if (!message) {
            return;
        }

        message.textContent = text;
        message.classList.add("show");
    }

    function hideStartButton() {
        if (startButton) {
            startButton.classList.add("is-hidden");
        }
    }

    function attachSource() {
        if (!video || attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage("视频暂时无法加载，请稍后重试。");
                }
            });
            return;
        }

        showMessage("当前浏览器暂不支持播放该视频。");
    }

    function playVideo() {
        if (!video) {
            return;
        }

        attachSource();
        hideStartButton();

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                showMessage("点击播放器控制栏即可开始播放。");
            });
        }
    }

    if (startButton) {
        startButton.addEventListener("click", playVideo);
    }

    if (video) {
        video.addEventListener("play", hideStartButton);
        video.addEventListener("error", function () {
            showMessage("视频暂时无法加载，请稍后重试。");
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
