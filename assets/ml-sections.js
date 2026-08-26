class MlFancySlideshow extends HTMLElement {
  constructor() {
    super();

    this.initSwiper();
    this.animateOnScroll();
  }

  initSwiper() {
    const sliderElem = this.querySelector(".swiper");

    const navigation = {
      enabled: sliderElem.dataset.swiperNavigation === "true",
      prevEl: ".swiper-button-prev",
      nextEl: ".swiper-button-next",
    };

    const pagination = {
      enabled:
        sliderElem.dataset.swiperPagination === "bullets" ||
        sliderElem.dataset.swiperPagination === "fraction",
      el: ".swiper-pagination",
      type: sliderElem.dataset.swiperPagination,
      dynamicBullets: false,
      dynamicMainBullets: 2,
      renderFraction: function (currentClass, totalClass) {
        return `<span class="${currentClass}"></span>/<span class="${totalClass}"></span>`;
      },
    };

    const effect = sliderElem.dataset.swiperEffect;

    const scrollbar = {
      enabled: sliderElem.dataset.swiperPagination === "scrollbar",
      el: sliderElem.querySelector(".swiper-scrollbar"),
      draggable: true,
    };

    const speed = Number(sliderElem.dataset.swiperSpeed || 300);

    const autoplay =
      sliderElem.dataset.swiperAutoplay === "0"
        ? undefined
        : { delay: Number(sliderElem.dataset.swiperAutoplay) * 1000 };

    const creativeEffect = {
      prev: { translate: [0, 0, -400] },
      next: { translate: ["100%", 0, 0] },
    };

    const breakpoints = {
      0: {
        slidesPerView: sliderElem.dataset.swiperPartial === "true" ? 1.4 : 1,
        spaceBetween:
          sliderElem.dataset.swiperSpacing === "true"
            ? Number(sliderElem.dataset.swiperSpacingMobile)
            : 0,
      },
      750: {
        slidesPerView: sliderElem.dataset.swiperPartial === "true" ? 1.3 : 1,
        spaceBetween:
          sliderElem.dataset.swiperSpacing === "true"
            ? Number(sliderElem.dataset.swiperSpacingDesktop)
            : 0,
      },
      990: {
        slidesPerView: sliderElem.dataset.swiperPartial === "true" ? 1.2 : 1,
        spaceBetween:
          sliderElem.dataset.swiperSpacing === "true"
            ? Number(sliderElem.dataset.swiperSpacingDesktop)
            : 0,
      },
    };

    this.slider = new window.Swiper(sliderElem, {
      navigation,
      pagination,
      scrollbar,
      effect,
      speed,
      autoplay,
      creativeEffect,
      breakpoints,
      centeredSlides: true,
      loop: true,
      watchSlidesProgress: true,
      fadeEffect: { crossFade: true },
      mousewheel: { enabled: true, forceToAxis: true },
      on: {},
    });
  }

  animateOnScroll() {
    window.addEventListener("scroll", () => {
      const windowHeight = window.innerHeight;
      const sectionHeight = this.clientHeight;

      const top = Math.round(this.getBoundingClientRect().top);
      const bottom = Math.round(this.getBoundingClientRect().bottom);
      const visibilityTop = Math.round(
        ((windowHeight - top) / sectionHeight) * 100
      );
      const visibilityBottom = Math.round((bottom / sectionHeight) * 100);

      if (visibilityTop > 0 && visibilityTop < 100) {
        this.querySelectorAll(".ml-media-wrapper").forEach((elem) => {
          const overlayOpacity = Number(elem.dataset.overlayOpacity);
          const final = Math.round(
            (100 - overlayOpacity) * (1 - visibilityTop / 100) + overlayOpacity
          );
          elem.style.setProperty("--overlay-opacity", final + "%");
        });
      } else if (visibilityBottom > 0 && visibilityBottom < 100) {
        this.querySelectorAll(".ml-media-wrapper").forEach((elem) => {
          const overlayOpacity = Number(elem.dataset.overlayOpacity);
          const final = Math.round(
            (100 - overlayOpacity) * (1 - visibilityBottom / 100) +
              overlayOpacity
          );
          elem.style.setProperty("--overlay-opacity", final + "%");
        });
      }
    });
  }
}
customElements.define("ml-fancy-slideshow", MlFancySlideshow);

class MlParallaxMedia extends HTMLElement {
  constructor() {
    super();

    this.animateOnScroll();

    const script = document.querySelector(
      'script[src*="vendor-simple-parallax"]'
    );
    script.onload = () => {
      this.init();
    };

    document.addEventListener("shopify:section:load", (event) => {
      if (event.detail.sectionId === this.dataset.sectionId) {
        this.init();
      }
    });
  }

  init() {
    new window.simpleParallax(
      this.querySelectorAll(".ml-parallax-media-media"),
      {
        orientation: this.dataset.parallaxOrientation,
        scale: Number(this.dataset.parallaxScale),
      }
    );
  }

  animateOnScroll() {
    window.addEventListener("scroll", () => {
      const windowHeight = window.innerHeight;
      const sectionHeight = this.clientHeight;

      const top = Math.round(this.getBoundingClientRect().top);
      const bottom = Math.round(this.getBoundingClientRect().bottom);
      const visibilityTop = Math.round(
        ((windowHeight - top) / sectionHeight) * 100
      );
      const visibilityBottom = Math.round((bottom / sectionHeight) * 100);

      if (visibilityTop > 0 && visibilityTop < 100) {
        this.querySelectorAll(".ml-media-wrapper").forEach((elem) => {
          const overlayOpacity = Number(elem.dataset.overlayOpacity);
          const final = Math.round(
            (100 - overlayOpacity) * (1 - visibilityTop / 100) + overlayOpacity
          );
          elem.style.setProperty("--overlay-opacity", final + "%");
        });
      } else if (visibilityBottom > 0 && visibilityBottom < 100) {
        this.querySelectorAll(".ml-media-wrapper").forEach((elem) => {
          const overlayOpacity = Number(elem.dataset.overlayOpacity);
          const final = Math.round(
            (100 - overlayOpacity) * (1 - visibilityBottom / 100) +
              overlayOpacity
          );
          elem.style.setProperty("--overlay-opacity", final + "%");
        });
      }
    });
  }
}
customElements.define("ml-parallax-media", MlParallaxMedia);

class MlStickyMedia extends HTMLElement {
  constructor() {
    super();

    this.animateOnScroll();
  }

  animateOnScroll() {
    window.addEventListener("scroll", () => {
      const windowHeight = window.innerHeight;

      const top = this.getBoundingClientRect().top;
      const bottom = this.getBoundingClientRect().bottom;
      const visibilityTop = Math.round((top / windowHeight) * 100);
      const visibilityBottom = Math.round((bottom / windowHeight) * 100);

      if (visibilityTop > 0 && visibilityTop < 100) {
        this.querySelectorAll(".ml-media-wrapper").forEach((elem) => {
          const overlayOpacity = Number(elem.dataset.overlayOpacity);
          const final = Math.round(
            ((100 - overlayOpacity) * visibilityTop) / 100 + overlayOpacity
          );
          elem.style.setProperty("--overlay-opacity", final + "%");
        });
      } else if (visibilityBottom > 0 && visibilityBottom < 100) {
        this.querySelectorAll(".ml-media-wrapper").forEach((elem) => {
          const overlayOpacity = Number(elem.dataset.overlayOpacity);
          const final = Math.round(
            (100 - overlayOpacity) * (1 - visibilityBottom / 100) +
              overlayOpacity
          );
          elem.style.setProperty("--overlay-opacity", final + "%");
        });
      }
    });
  }
}
customElements.define("ml-sticky-media", MlStickyMedia);

class MlMarquee extends HTMLElement {
  constructor() {
    super();

    this.init();

    document.addEventListener("shopify:section:load", (event) => {
      if (event.detail.sectionId === this.dataset.sectionId) {
        this.init();
      }
    });
  }

  init() {
    const list = this.querySelector(".ml-marquee-list");
    list
      .querySelectorAll('.ml-marquee-item[aria-hidden="true"]')
      .forEach((elem) => elem.remove());

    const marqueeWidth = list.scrollWidth;
    const marqueeLength = list.querySelectorAll("li").length;

    list.insertAdjacentHTML("beforeEnd", list.innerHTML);
    list.insertAdjacentHTML("beforeEnd", list.innerHTML);

    list.querySelectorAll(".ml-marquee-item").forEach((item, index) => {
      if (index >= marqueeLength) {
        item.setAttribute("aria-hidden", "true");
      }
    });

    let style = `
      <style>
        #ml-marquee-${this.dataset.marqueeId} .ml-marquee-list {
          animation-name: eg_marquee_animation_${this.dataset.marqueeId};
          animation-duration: ${this.dataset.marqueeDuration}s;
        }
        @keyframes eg_marquee_animation_${this.dataset.marqueeId} {
          to { transform: translateX(-${marqueeWidth}px); }
        }
      </style>
    `;
    if (this.dataset.marqueeDirection === "right") {
      style += `
        <style>
          @keyframes eg_marquee_animation_${this.dataset.marqueeId} {
            from { transform: translateX(-${marqueeWidth}px); }    
            to { transform: 0); }    
          }
        </style>
      `;
    }

    this.insertAdjacentHTML("beforeBegin", style);
  }
}
customElements.define("ml-marquee", MlMarquee);

class MlShoppableVideos extends HTMLElement {
  constructor() {
    super();

    this.querySelectorAll("video").forEach((video) => {
      video.addEventListener("click", () => {
        this.onVideoPlay(video);
      });
    });

    this.querySelectorAll("a[data-quick-view]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.openQuickView(link);
      });
    });

    this.querySelector(".slider").addEventListener("scroll", () => {
      this.querySelectorAll("video").forEach((video) => {
        video.closest(".card").setAttribute("data-playing", "false");
        video.pause();
      });
    });
  }

  onVideoPlay(video) {
    this.querySelectorAll("video").forEach((elem) => {
      if (elem.dataset.index !== video.dataset.index) {
        elem.closest(".card").setAttribute("data-playing", "false");
        elem.pause();
      }
    });

    const card = video.closest(".card");

    if (card.dataset.playing === "true") {
      video.closest(".card").setAttribute("data-playing", "false");
      video.pause();
    } else {
      video.closest(".card").setAttribute("data-playing", "true");
      video.muted = false;
      video.play();
    }
  }

  async openQuickView(link) {
    link.disabled = true;
    link.setAttribute("aria-busy", "true");
    link.querySelector(".icon-wrapper").setAttribute("hidden", "hidden");
    link.querySelector(".spinner-border").removeAttribute("hidden");

    const response = await fetch(link.dataset.productUrl + ".js");

    if (response.ok) {
      const data = await response.json();
      console.log(data);

      document.querySelector("product-quick-view-modal").showModal(data);
    }

    link.disabled = false;
    link.removeAttribute("aria-busy");
    link.querySelector(".icon-wrapper").removeAttribute("hidden");
    link.querySelector(".spinner-border").setAttribute("hidden", "hidden");
  }
}
customElements.define("ml-shoppable-videos", MlShoppableVideos);

class MlImageCompare extends HTMLElement {
  constructor() {
    super();

    const script = document.querySelector(
      'script[src*="vendor-image-compare"]'
    );
    script.onload = () => {
      this.init();
    };

    document.addEventListener("shopify:section:load", (event) => {
      if (event.detail.sectionId === this.dataset.sectionId) {
        this.init();
      }
    });
  }

  init() {
    this.querySelectorAll("[data-image-compare]").forEach((elem) => {
      new window.ImageCompare(elem, {
        controlColor: this.dataset.icvControlsColor,
        controlShadow: true,
        addCircle: this.dataset.icvControlsCircle === "true",
        addCircleBlur: true,
        showLabels: this.dataset.icvShowLabels === "true",
        labelOptions: {
          before: this.dataset.icvLabelBefore,
          after: this.dataset.icvLabelAfter,
          onHover: false,
        },
        smoothing: this.dataset.icvSmoothing === "true",
        smoothingAmount: 100,
        hoverStart: this.dataset.icvHoverStart === "true",
        verticalMode: this.dataset.icvVerticalMode === "true",
        startingPoint: Number(this.dataset.icvStartingPoint),
        fluidMode: false,
      }).mount();
    });
  }
}
customElements.define("ml-image-compare", MlImageCompare);

class MlInstagramGallery extends HTMLElement {
  constructor() {
    super();

    this.gallery = new window.Swiper(this, {
      speed: Number(this.dataset.sliderSpeed),
      spaceBetween: 12,
      centeredSlides: true,
      autoplay: this.autoplay,
      loop: true,
      navigation: {
        prevEl: ".swiper-button-prev",
        nextEl: ".swiper-button-next",
      },
      mousewheel: {
        enabled: true,
        forceToAxis: true,
      },
      breakpoints: {
        0: {
          slidesPerView: 1.4,
          spaceBetween: this.spacingMobile,
        },
        600: {
          slidesPerView: 2,
          spaceBetween: this.spacingMobile,
        },
        900: {
          slidesPerView: 3,
          spaceBetween: this.spacingMobile,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: this.spacingDesktop,
        },
        1500: {
          slidesPerView: 5,
          spaceBetween: this.spacingDesktop,
        },
        1800: {
          slidesPerView: 6,
          spaceBetween: this.spacingDesktop,
        },
      },
    });
  }

  spacingMobile =
    this.dataset.swiperSpacing === "true"
      ? Number(this.dataset.swiperSpacingMobile)
      : 0;
  spacingDesktop =
    this.dataset.swiperSpacing === "true"
      ? Number(this.dataset.swiperSpacingDesktop)
      : 0;

  autoplay =
    this.dataset.sliderAutoplay === "0"
      ? undefined
      : {
          delay: Number(this.dataset.sliderAutoplay) * 1000,
          pauseOnMouseEnter: true,
        };
}
customElements.define("ml-instagram-gallery", MlInstagramGallery);

class MlNewsletterPopup extends HTMLElement {
  constructor() {
    super();

    if (window.Shopify.designMode) return;

    if (window.location.href.includes("newsletter-popup")) {
      this.open();
      return;
    }

    if (document.cookie.indexOf("ml-newsletter-popup") > -1) {
      return;
    }

    (async () => {
      await new Promise((resolve) =>
        setTimeout(resolve, Number(this.dataset.configDelay) * 1000)
      );
      window.mlCreateCookie(
        "ml-newsletter-popup",
        true,
        Number(this.dataset.configDaysToWait)
      );
      this.open();
    })();
  }

  onBodyClick(event) {
    if (event.target.classList.contains("ml-dawn-modal")) {
      this.close(false);
    }
  }

  open() {
    this.onBodyClickEvent =
      this.onBodyClickEvent || this.onBodyClick.bind(this);
    this.setAttribute("open", true);
    document.body.addEventListener("click", this.onBodyClickEvent);
    document.body.classList.add("overflow-hidden");
    this.querySelector(".ml-dawn-modal-toggler").addEventListener(
      "click",
      this.close.bind(this)
    );
    window.trapFocus(this.querySelector('[tabindex="-1"]'));
  }

  close() {
    this.removeAttribute("open");
    document.body.removeEventListener("click", this.onBodyClickEvent);
    document.body.classList.remove("overflow-hidden");
    window.removeTrapFocus();
  }
}
customElements.define("ml-newsletter-popup", MlNewsletterPopup);

class MlLookBook extends HTMLElement {
  constructor() {
    super();

    this.injectVendorScripts();
    this.querySelectorAll(".ml-lookbook-point-list-item").forEach((elem) => {
      this.handleTooltip(elem);
    });
  }

  async injectVendorScripts() {
    if (!window.FloatingUICore) {
      const script = document.createElement("script");
      script.setAttribute(
        "src",
        "https://cdn.jsdelivr.net/npm/@floating-ui/core@1.6.8"
      );
      document.head.appendChild(script);
    }
    if (!window.FloatingUIDOM) {
      await new Promise((r) => setTimeout(r, 500));

      const script = document.createElement("script");
      script.setAttribute(
        "src",
        "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.8"
      );
      document.head.appendChild(script);
    }
  }

  handleTooltip(elem) {
    const btn = elem.querySelector("button");
    const tooltip = elem.querySelector(".ml-tooltip");

    function update() {
      window.FloatingUIDOM.computePosition(btn, tooltip, {
        middleware: [
          window.FloatingUIDOM.offset(0),
          window.FloatingUIDOM.autoPlacement(),
          window.FloatingUIDOM.shift({ padding: 8 })
        ],
      }).then(({ x, y }) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    }

    function showTooltip() {
      tooltip.classList.add("show");
      update();
    }

    function hideTooltip() {
      setTimeout(() => {
        tooltip.classList.remove("show");
        tooltip.classList.add("hiding");
        setTimeout(() => {
          tooltip.classList.remove("hiding");
        }, 200);
      }, 100);
    }

    if (window.matchMedia("(pointer: coarse)").matches) {
      [
        ["mouseenter", showTooltip],
        ["mouseleave", hideTooltip],
        ["focus", showTooltip],
        ["blur", hideTooltip],
      ].forEach(([event, listener]) => {
        btn.addEventListener(event, listener);
      });
    } else {
      [
        ["focus", showTooltip],
        ["blur", hideTooltip],
      ].forEach(([event, listener]) => {
        btn.addEventListener(event, listener);
      });
    }
  }
}
customElements.define("ml-lookbook", MlLookBook);

class MlSimpleCollections extends HTMLElement {
  constructor() {
    super();

    if (window.matchMedia("(max-width: 749px)").matches) {
      setTimeout(() => {
        const left =
          this.querySelector(
            ".ml-simple-collections-list-item.active"
          )?.getBoundingClientRect().left || 0;
        console.log(left);
        this.querySelector(".ml-simple-collections-list").scrollBy({
          left,
          behavior: "smooth",
        });
      }, 1000);
    }
  }
}
customElements.define("ml-simple-collections", MlSimpleCollections);

class MlCrossSells extends HTMLElement {
  constructor() {
    super();

    this.querySelectorAll('input[type="checkbox"').forEach((checkbox) => {
      checkbox.addEventListener("change", () =>
        this.onCheckboxChange(checkbox)
      );
    });

    this.querySelectorAll('select[name="variant-id"').forEach((select) => {
      select.addEventListener("change", () => this.onChangeVariant(select));
    });

    this.querySelectorAll("[data-cross-sells-footer] .button").forEach(
      (btn) => {
        btn.addEventListener("click", () => this.addToCart(btn));
      }
    );
  }

  onChangeVariant(select) {
    const variantImage = select[select.selectedIndex].dataset.variantImage;

    if (variantImage.length) {
      select
        .closest("[data-cross-sells-list-item]")
        .querySelector(".img-wrapper img")
        .setAttribute("src", variantImage);
    }

    this.updateTotalPrice();
  }

  onCheckboxChange(checkbox) {
    if (checkbox.checked) {
      checkbox
        .closest("[data-cross-sells-list-item]")
        .setAttribute("data-is-selected", "true");
    } else {
      checkbox
        .closest("[data-cross-sells-list-item]")
        .setAttribute("data-is-selected", "false");
    }
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    let totalPrice = 0;
    let totalComparePrice = 0;

    this.querySelectorAll('input[type="checkbox"').forEach((checkbox) => {
      if (checkbox.checked) {
        const inputHidden = checkbox
          .closest("[data-cross-sells-list-item]")
          .querySelector('input[name="variant-id"][type="hidden"]');
        if (inputHidden) {
          totalPrice += Number(inputHidden.dataset.price);
          totalComparePrice += Number(inputHidden.dataset.compareAtPrice);
        }

        const select = checkbox
          .closest("[data-cross-sells-list-item]")
          .querySelector('select[name="variant-id"]');
        if (select) {
          totalPrice += Number(select[select.selectedIndex].dataset.price);
          totalComparePrice += Number(
            select[select.selectedIndex].dataset.compareAtPrice
          );
        }
      }
    });

    this.querySelectorAll("[data-total-price]").forEach((elem) => {
      elem.textContent = `${window.Shopify.formatMoney(totalPrice)}`.replace(
        ".00",
        ""
      );
    });

    this.querySelectorAll("[data-total-compare-price]").forEach((elem) => {
      elem.textContent = `${window.Shopify.formatMoney(
        totalComparePrice
      )}`.replace(".00", "");
    });

    this.querySelectorAll("[data-total-savings]").forEach((elem) => {
      elem.textContent = `${window.Shopify.formatMoney(
        totalComparePrice - totalPrice
      )}`.replace(".00", "");
    });

    if (totalPrice === 0) {
      this.querySelector("[data-cross-sells-footer] .button").disabled = true;
    } else {
      this.querySelector("[data-cross-sells-footer] .button").disabled = false;
    }

    if (totalComparePrice > totalPrice) {
      this.querySelectorAll("[data-total-compare-price]").forEach((elem) => {
        elem.closest("s").removeAttribute("hidden");
      });
      this.querySelectorAll("[data-total-savings]").forEach((elem) => {
        elem.parentElement.removeAttribute("hidden");
      });
    } else {
      this.querySelectorAll("[data-total-compare-price]").forEach((elem) => {
        elem.closest("s").setAttribute("hidden", "hidden");
      });
      this.querySelectorAll("[data-total-savings]").forEach((elem) => {
        elem.parentElement.setAttribute("hidden", "hidden");
      });
    }
  }

  async addToCart(atcBtn) {
    atcBtn.classList.add("loading");
    atcBtn.disabled = true;
    atcBtn.setAttribute("aria-busy", "true");
    atcBtn.querySelector(".loading__spinner").classList.remove("hidden");

    const items = [];

    this.querySelectorAll('input[type="checkbox"').forEach((checkbox) => {
      if (checkbox.checked) {
        const id = Number(
          checkbox
            .closest("[data-cross-sells-list-item]")
            .querySelector('[name="variant-id"]').value
        );

        items.push({
          id,
          quantity: 1,
        });
      }
    });

    const cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    let sections = cart.getSectionsToRender().map((section) => section.id);

    const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, sections }),
    });
    const responseData = await response.json();

    cart.renderContents(responseData);
    if (cart && cart.classList.contains("is-empty"))
      cart.classList.remove("is-empty");

    atcBtn.style.width = "";
    atcBtn.classList.remove("loading");
    atcBtn.disabled = false;
    atcBtn.setAttribute("aria-busy", "false");
    atcBtn.querySelector(".loading__spinner").classList.add("hidden");
  }
}
customElements.define("ml-cross-sells", MlCrossSells);
