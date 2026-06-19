(function () {
  window.initializeMoviePlayer = function (videoId, buttonId, overlayId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button || !overlay || !source) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      loadSource();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    button.addEventListener('click', startPlayback);
    overlay.addEventListener('click', startPlayback);
    overlay.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startPlayback();
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
