(async function () {
  const familyCode     = window.SIBLING_FAMILY_CODE;   // e.g. 03426
  const sizeCode       = window.SIBLING_SIZE_CODE;     // e.g. xw / m / w
  const currentHandle  = window.CURRENT_HANDLE;
  const productType    = window.PRODUCT_TYPE;
  const plpComingSoon  = window.PLP_COMING_SOON;

  if (!familyCode || !currentHandle) return;

  /* ----------------------------------------
     CACHE KEY
     "pdp" namespace keeps this separate from
     siblings-plp.js, which stores a different
     object shape (no onSale field) under the
     same family/size combination.
     Increment CACHE_VERSION whenever the stored
     object shape or detection logic changes.
  ---------------------------------------- */
  const CACHE_VERSION = '2';

  const cacheKey = `siblings_pdp_${familyCode}_${sizeCode || 'all'}_v${CACHE_VERSION}`;
  const cached = sessionStorage.getItem(cacheKey);

  let siblings = [];

  /* ----------------------------------------
     LOAD FROM CACHE
  ---------------------------------------- */
  if (cached) {
    siblings = JSON.parse(cached);
  } 
  /* ----------------------------------------
     FETCH + ASSIGN (Neptune-style)
  ---------------------------------------- */
  else {
    const res = await fetch(`/search?q=${encodeURIComponent(familyCode)}*&type=product`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const items = doc.querySelectorAll('.grid__item');

    items.forEach(item => {
      const titleEl = item.querySelector('.card__heading a');
      const imgEl   = item.querySelector('img');
      const badge   = item.textContent || '';
      const onSale  = item.querySelector('.card-wrapper')?.dataset.onSale === 'true';

      if (!titleEl) return;

      const title = titleEl.textContent.trim();

      // -------------------------------
      // BASE + SIZE (Neptune logic)
      // -------------------------------
      const base = title.split('-')[0]?.trim();
      const size = title
        .split('|')[0]
        ?.split('-')
        .pop()
        ?.trim();

      // ❌ family mismatch
      if (base !== familyCode) return;

      // ❌ size mismatch (FOOTWEAR only)
      if (productType === 'FOOTWEAR' && sizeCode && size !== sizeCode) return;

      const handle = titleEl.getAttribute('href')
        ?.split('/products/')[1]
        ?.split('?')[0];

      if (!handle) return;

      const available   = !badge.includes('Sold out');
      const comingSoon  = badge.includes('SMART_TAG_COMINGSOON');

      // -------------------------------
      // AVAILABILITY RULES (Neptune)
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

      // ✅ ASSIGN SIBLING (clean list)
      siblings.push({
        title,
        handle,
        image: imgEl?.src || '',
        available,
        comingSoon,
        onSale
      });
    });

    sessionStorage.setItem(cacheKey, JSON.stringify(siblings));
  }

  /* ----------------------------------------
     ENSURE CURRENT PRODUCT IS PRESENT
  ---------------------------------------- */
  if (!siblings.some(p => p.handle === currentHandle) && window.product) {
    const currentComingSoonActive = window.product.tags?.includes('SMART_TAG_COMINGSOON') && window.COMING_SOON_ENABLED;
    const currentOnSale = window.product.tags?.includes('SALE') && !currentComingSoonActive;

    siblings.unshift({
      title: window.product.title,
      handle: currentHandle,
      image: window.product.featured_image,
      available: window.product.available,
      comingSoon: window.product.tags?.includes('SMART_TAG_COMINGSOON'),
      onSale: currentOnSale
    });
  }

  /* ----------------------------------------
     RENDER
  ---------------------------------------- */
  renderSiblings(siblings, currentHandle);

})();