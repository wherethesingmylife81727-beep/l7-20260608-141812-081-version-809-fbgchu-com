(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var source = shell.getAttribute('data-video-url');
    var hlsInstance = null;
    var ready = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function init() {
      if (ready || !video || !source) {
        return Promise.resolve();
      }
      ready = true;
      setMessage('正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('播放源已加载');
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已加载');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请刷新页面后重试。');
          }
        });
        return Promise.resolve();
      }

      video.src = source;
      setMessage('当前浏览器将尝试直接播放 HLS 源。');
      return Promise.resolve();
    }

    function play() {
      init().then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击播放器播放。');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        init();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
}());
