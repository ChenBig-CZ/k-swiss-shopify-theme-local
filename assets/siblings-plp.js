/* ===============================
   SIBLING SWATCH INIT (PLP)
================================ */

async function initSiblingSwatches(context = document) {
  const cards = context.querySelectorAll('.collection-siblings');
  if (!cards.length) return;

  const cache = window.__SIBLING_CACHE__ || (window.__SIBLING_CACHE__ = {});

  for (const card of cards) {
    if (card.dataset.initialized === 'true') continue;
    card.dataset.initialized = 'true';

    const familyCode     = card.dataset.family;   // 03426
    const sizeCode       = card.dataset.size;     // xw / m / w
    const currentHandle  = card.dataset.handle;
    const productType    = card.dataset.type;
    const plpComingSoon  = window.PLP_COMING_SOON;

    if (!familyCode || !currentHandle) continue;

    /* "plp" namespace keeps this separate from siblings-pdp.js, which
       stores a different object shape under the same family/size.
       Increment CACHE_VERSION when the stored object shape changes. */
    const CACHE_VERSION = '2';

    const cacheKey = `plp_${familyCode}_${sizeCode || 'all'}_v${CACHE_VERSION}`;

    /* ----------------------------------------
       CACHE
    ---------------------------------------- */
    if (!cache[cacheKey]) {
      let siblings = [];

      const storageKey = `siblings_${cacheKey}`;
      const cached = sessionStorage.getItem(storageKey);

      if (cached) {
        siblings = JSON.parse(cached);
      } 
      /* ----------------------------------------
         FETCH + ASSIGN (PDP SAME LOGIC)
      ---------------------------------------- */
      else {
        const res = await fetch(`/search?q=${encodeURIComponent(familyCode)}*&type=product`);
        const html = await res.text();

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const items = doc.querySelectorAll('.grid__item');

        items.forEach(item => {
          const link  = item.querySelector('.card__heading a');
          const img   = item.querySelector('img');
          const text  = item.textContent || '';

          if (!link) return;

          const title = link.textContent.trim();

          // -------------------------------
          // BASE + SIZE (same as PDP)
          // -------------------------------
          const base = title.split('-')[0]?.trim();
          const size = title
            .split('|')[0]
            ?.split('-')
            .pop()
            ?.trim();

          if (base !== familyCode) return;

          if (productType === 'FOOTWEAR' && sizeCode && size !== sizeCode) return;

          const handle = link.href.split('/products/')[1]?.split('?')[0];
          if (!handle) return;

          const available  = !text.includes('Sold out');
          const comingSoon = text.includes('SMART_TAG_COMINGSOON');

          // -------------------------------
          // AVAILABILITY RULES (same as PDP)
          // -------------------------------
          if (productType === 'FOOTWEAR') {
            if (plpComingSoon) {
              if (!available && !comingSoon) return;
            } else {
              if (!available) return;
            }
          } else {
            if (plpComingSoon) {
              if (!available && !comingSoon) return;
            } else {
              if (!available) return;
            }
          }

          siblings.push({
            title,
            handle,
            url: link.getAttribute('href'),
            image: img?.src || '',
            available,
            comingSoon
          });
        });

        sessionStorage.setItem(storageKey, JSON.stringify(siblings));
      }

      cache[cacheKey] = siblings;
    }

    /* ----------------------------------------
       RENDER (UNCHANGED)
    ---------------------------------------- */
    renderSiblings(card, cache[cacheKey], currentHandle);
  }
}

/* ===============================
   DRAG SCROLL (UNCHANGED)
================================ */

function initSiblingScroll(context = document) {
  context.querySelectorAll('.collection-siblings__grid').forEach(grid => {
    if (grid.dataset.scrollInit === 'true') return;
    grid.dataset.scrollInit = 'true';

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    grid.addEventListener('mousedown', e => {
      e.stopPropagation();
      isDown = true;
      startX = e.pageX;
      scrollLeft = grid.scrollLeft;
      hasDragged = false;
      grid.classList.add('is-dragging');
      grid.querySelectorAll('a, img').forEach(el => el.style.pointerEvents = 'none');
    });

    /* MOBILE FIX */
    grid.addEventListener('touchstart', e => {
      e.stopPropagation();
    }, { passive: false });

    grid.addEventListener('touchmove', e => {
      e.stopPropagation();   // 👈 THIS is the main fix
    }, { passive: false });

    grid.addEventListener('touchend', e => {
      e.stopPropagation();
    });

    grid.addEventListener('mousemove', e => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 5) {
        hasDragged = true;
        grid.scrollLeft = scrollLeft - dx;
      }
    });

    const stop = () => {
      isDown = false;
      grid.classList.remove('is-dragging');
      setTimeout(() => {
        grid.querySelectorAll('a, img').forEach(el => el.style.pointerEvents = '');
      }, 50);
    };

    grid.addEventListener('mouseup', stop);
    grid.addEventListener('mouseleave', stop);

    grid.addEventListener('click', e => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });
}

/* ===============================
   CLICK HANDLER (UNCHANGED)
================================ */

document.addEventListener('click', e => {
  const btn = e.target.closest('.sibling-link');
  if (!btn) return;
  const url = btn.dataset.url;
  if (url) window.location.href = url;
});

/* ===============================
   INIT + AJAX OBSERVER
================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSiblingSwatches();
  initSiblingScroll();
});

const gridContainer = document.querySelector('#ProductGridContainer');
if (gridContainer) {
  new MutationObserver(() => {
    initSiblingSwatches(gridContainer);
    initSiblingScroll(gridContainer);
  }).observe(gridContainer, {
    childList: true,
    subtree: true
  });
}