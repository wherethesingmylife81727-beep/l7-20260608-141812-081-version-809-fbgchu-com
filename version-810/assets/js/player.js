function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var playButton = document.getElementById(options.playButtonId);
  var source = options.source;
  var attached = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          hls.destroy();
          hls = null;
          video.src = source;
        }
      });
    } else {
      video.src = source;
    }
  }

  function start() {
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.play().catch(function () {});
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
