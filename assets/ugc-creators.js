/* Creator Videos - Firework style shoppable deck */
(function () {
  'use strict';

  function initSection(section) {
    if (!section || section.dataset.ugcvReady === 'true') return;
    section.dataset.ugcvReady = 'true';

    var track = section.querySelector('[data-ugcv-track]');
    var prevBtn = section.querySelector('[data-ugcv-prev]');
    var nextBtn = section.querySelector('[data-ugcv-next]');
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-ugcv-card]'));

    /* ---------- Cards ---------- */
    cards.forEach(function (card) {
      var media = card.querySelector('[data-ugcv-media]');
      var video = card.querySelector('[data-ugcv-video]');
      var playBtn = card.querySelector('[data-ugcv-play]');
      var muteBtn = card.querySelector('[data-ugcv-mute]');
      var openBtn = card.querySelector('[data-ugcv-open]');
      var closeBtn = card.querySelector('[data-ugcv-close]');

      if (!video) return;

      // Sticky = keep playing after the cursor leaves the card
      var sticky = false;

      function play() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      video.addEventListener('playing', function () {
        card.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        card.classList.remove('is-playing');
      });

      // Hover preview on desktop
      card.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: none)').matches) return;
        play();
      });

      card.addEventListener('mouseleave', function () {
        if (window.matchMedia('(hover: none)').matches) return;
        if (sticky) return;
        // Pause only - keep the current position so hover resumes from here
        video.pause();
      });

      // Click play button -> keep playing even after hover ends
      if (playBtn) {
        playBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          sticky = true;
          play();
        });
      }

      // Click anywhere on the video toggles play/pause
      if (media) {
        media.addEventListener('click', function (event) {
          if (event.target.closest('[data-ugcv-mute]')) return;
          if (event.target.closest('[data-ugcv-play]')) return;
          if (event.target.closest('.ugcv-handle')) return;

          if (video.paused) {
            sticky = true;
            play();
          } else {
            sticky = false;
            video.pause();
          }
        });
      }

      // Mute / unmute with icon swap
      if (muteBtn) {
        muteBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          var willUnmute = video.muted;

          if (willUnmute) {
            // Only one video may have sound at a time
            cards.forEach(function (other) {
              if (other === card) return;
              var otherVideo = other.querySelector('[data-ugcv-video]');
              var otherBtn = other.querySelector('[data-ugcv-mute]');
              if (otherVideo) otherVideo.muted = true;
              if (otherBtn) {
                otherBtn.classList.remove('is-unmuted');
                otherBtn.setAttribute('aria-label', 'Unmute video');
              }
            });

            sticky = true;
            play();
          }

          video.muted = !willUnmute;
          muteBtn.classList.toggle('is-unmuted', willUnmute);
          muteBtn.setAttribute('aria-label', willUnmute ? 'Mute video' : 'Unmute video');
        });
      }

      // Product panel opens upward
      function setPanel(open) {
        card.classList.toggle('is-open', open);
        if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      if (openBtn) {
        openBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          // Close any other open panel first
          cards.forEach(function (other) {
            if (other !== card) other.classList.remove('is-open');
          });

          setPanel(!card.classList.contains('is-open'));
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          setPanel(false);
        });
      }
    });

    /* ---------- Slider ---------- */
    if (!track) return;

    function step() {
      var card = track.querySelector('[data-ugcv-card]');
      if (!card) return track.clientWidth;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function updateArrows() {
      var scrollable = track.scrollWidth - track.clientWidth > 2;
      section.classList.toggle('has-slider', scrollable);

      if (!prevBtn || !nextBtn) return;

      if (!scrollable) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        track.scrollBy({ left: -step(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        track.scrollBy({ left: step(), behavior: 'smooth' });
      });
    }

    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  function initAll() {
    document.querySelectorAll('[data-ugcv-section]').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Theme editor support
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('[data-ugcv-section]');
    if (section) initSection(section);
  });

  document.addEventListener('shopify:block:select', function (event) {
    var card = event.target.closest('[data-ugcv-card]');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
})();