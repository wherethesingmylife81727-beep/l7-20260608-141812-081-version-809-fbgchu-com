(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var player = document.querySelector('.js-player');
    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var started = false;
    var hls = null;
    var src = typeof playerSource === 'string' ? playerSource : '';

    function attach() {
      if (started || !video || !src) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
