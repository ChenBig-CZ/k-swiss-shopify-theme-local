class MlProductInventory extends HTMLElement {
  constructor() {
    super();

    document
      .querySelector("product-info")
      .addEventListener("product-info:loaded", () => {
        // console.log(event)
        this.initProgressBar();
      });

    document.querySelector("product-info").addEventListener("change", () => {
      // console.log(event)
      this.initProgressBar();
    });
  }

  initProgressBar() {
    setTimeout(() => {
      const progressBar = this.querySelector(".bs-progress-bar");
      progressBar.style.width = progressBar.dataset.width;
    }, 500);
  }
}
customElements.define("ml-product-inventory", MlProductInventory);

class MlProductQtyBreak extends HTMLElement {
  constructor() {
    super();

    this.closest(".product")
      .querySelectorAll("ml-product-qty-break")
      .forEach((elem, index) => {
        elem.setAttribute("data-index", index);
      });

    this.handleInputChange();
    this.handleOptionChange();
    this.handleMainVariantChange();
    this.handleAtc();
  }

  handleInputChange() {
    this.querySelector("input").addEventListener("change", () => {
      const atcBtn =
        this.closest(".product").querySelector('button[name="add"]');

      setTimeout(() => {
        atcBtn.classList.add("animate__animated", "animate__shakeX");
      }, 250);

      setTimeout(() => {
        atcBtn.classList.remove("animate__animated", "animate__shakeX");
      }, 1500);
    });
  }

  handleOptionChange() {
    this.querySelectorAll(".ml-product-block-qty-break-variant select").forEach(
      (select) => {
        select.addEventListener("change", async () => {
          const response = await fetch(`${this.dataset.productUrl}.js`);
          const productData = await response.json();
          console.log(productData);

          let totalPrice = 0;
          const discount = Number(this.dataset.discount); 
          let selectedVariants = "";

          this.querySelectorAll(".ml-product-block-qty-break-variant").forEach(
            (elem) => {
              const selectedOptions = [];

              elem.querySelectorAll("select").forEach((select) => {
                selectedOptions.push(select.value);
              });

              const selectedVariant = productData.variants.find(
                (variant) =>
                  JSON.stringify(variant.options) ===
                  JSON.stringify(selectedOptions)
              );

              totalPrice += selectedVariant.price;
              selectedVariants += `${selectedVariant.id},`;
            }
          );

          this.querySelector(".ml-product-block-qty-break-total").innerHTML = `
          ${window.Shopify.formatMoney(
            (totalPrice * (100 - discount)) / 100
          ).replace(".00", "")} <s>${window.Shopify.formatMoney(
            totalPrice
          ).replace(".00", "")}</s>
        `;

          this.querySelector("input").value = selectedVariants.slice(0, -1);
        });
      }
    );
  }

  handleMainVariantChange() {
    if (this.dataset.index !== "0") return;

    this.closest(".product")
      .querySelectorAll("variant-selects input, variant-selects select")
      .forEach((elem) => {
        elem.addEventListener("change", async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const variantId = this.closest(".product").querySelector("input[name='id']").value;

          const response = await fetch(`${this.dataset.productUrl}?variant=${variantId}`);
          const text = await response.text();
          const newDocument = new DOMParser().parseFromString(
            text,
            "text/html"
          );

          this.closest(".product")
            .querySelectorAll(".ml-product-block-qty-break")
            .forEach((elem) => {
              elem.replaceWith(
                newDocument.querySelector(
                  `#ml-product-block-qty-break-${elem.dataset.blockId}`
                )
              );
            });

          this.handleInputChange();
        });
      });
  }

  handleAtc() {
    if (this.dataset.index !== "0") return;

    const atcBtn = this.closest(".product").querySelector('button[name="add"]');

    atcBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      let variantIds = this.closest(".product").querySelector(
        ".ml-product-block-qty-break input:checked"
      )?.value;

      atcBtn.classList.add("loading");
      atcBtn.disabled = true;
      atcBtn.setAttribute("aria-busy", "true");
      atcBtn.querySelector(".loading__spinner").classList.remove("hidden");
      atcBtn.closest("product-form").handleErrorMessage();

      const items = [];

      variantIds.split(",").forEach((id) => {
        items.push({
          id,
          quantity: 1,
        });
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

      if (response.ok) {
        cart.renderContents(responseData);
        if (cart && cart.classList.contains("is-empty"))
          cart.classList.remove("is-empty");
      } else {
        atcBtn
          .closest("product-form")
          .handleErrorMessage(responseData.description);
      }

      atcBtn.style.width = "";
      atcBtn.classList.remove("loading");
      atcBtn.disabled = false;
      atcBtn.setAttribute("aria-busy", "false");
      atcBtn.querySelector(".loading__spinner").classList.add("hidden");
    });
  }
}
customElements.define("ml-product-qty-break", MlProductQtyBreak);

class MlStickyATC extends HTMLElement {
  constructor() {
    super();

    this.variantSelector = this.querySelector('select[name="id"]');
    this.mainVariantInput = document.querySelector(
      '.product .product-form input[name="id"]'
    );

    this.init();

    this.variantSelector?.addEventListener("change", (event) => {
      this.onVariantChange(event);
    });

    this.mainVariantInput.addEventListener("change", (event) => {
      this.onMainProductFormVariantChange(event);
    });
  }

  init() {
    const top =
      document.querySelector(".product product-form").getBoundingClientRect()
        .bottom + window.scrollY;

    window.addEventListener("scroll", () => {
      if (window.scrollY > top) {
        if (document.querySelector(".product .ml-sticky-atc")) {
          document.body.insertAdjacentElement("beforeend", this);
        }
        this.classList.add("show");
        document.body.style.paddingBottom = this.clientHeight + "px";
      } else {
        this.classList.remove("show");
        document.body.style.paddingBottom = 0;
      }
    });
  }

  onVariantChange(event) {
    event.preventDefault();
    const imgSrc =
      this.variantSelector.options[this.variantSelector.selectedIndex].dataset
        .variantImg;

    if (imgSrc) {
      const img = this.variantSelector
        .closest(".ml-sticky-atc")
        .querySelector(".ml-sticky-atc-img");
      img.src = imgSrc;
    }
  }

  onMainProductFormVariantChange() {
    this.variantSelector.value = this.mainVariantInput.value;
    this.variantSelector.dispatchEvent(new Event("change"));
  }
}
customElements.define("ml-sticky-atc", MlStickyATC);

class MlProductPrevNext extends HTMLElement {
  constructor() {
    super();

    this.injectVendorScripts();

    if (window.matchMedia("(min-width: 750px").matches) {
      document.body.insertAdjacentElement("beforeend", this);
    }

    this.querySelectorAll(".ml-product-block-prev-next-inner").forEach(
      (elem) => {
        this.handleTooltip(elem);
      }
    );
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
    const btn = elem.querySelector("a");
    const tooltip = elem.querySelector(".ml-tooltip");

    if (!btn) return;

    async function update() {
      window.FloatingUIDOM.computePosition(btn, tooltip, {
        middleware: [
          window.FloatingUIDOM.offset(10),
          window.FloatingUIDOM.autoPlacement(),
        ],
      }).then(({ x, y }) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    }

    async function showTooltip() {
      await new Promise((resolve) => setTimeout(resolve, 200));

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

    [
      ["mouseenter", showTooltip],
      ["mouseleave", hideTooltip],
      ["focus", showTooltip],
      ["blur", hideTooltip],
    ].forEach(([event, listener]) => {
      btn.addEventListener(event, listener);
    });
  }
}
customElements.define("ml-product-prev-next", MlProductPrevNext);

class MlPersonalizationField extends HTMLElement {
  constructor() {
    super();

    this.form = this.closest(".product").querySelector("product-form form");
    this.atcBtn = this.form.querySelector('button[name="add"]');
    this.buyBtn = this.form.querySelector("shopify-buy-it-now-button button");

    switch (this.dataset.type) {
      case "text":
      case "email":
      case "tel":
      case "textarea":
      case "date":
        this.handleInput();
        break;
      case "select":
        this.handleSelect();
        break;
      case "checkbox":
        this.handleCheckboxes();
        break;
      case "radio":
        this.handleRadios();
        break;
      case "file":
        break;
    }
  }

  handleInput() {
    const input = this.querySelector(".field__input");

    this.form.insertAdjacentHTML(
      "beforeend",
      `
      <input type="hidden" name="${input.getAttribute("name")}" value="${
        input.value
      }" required>
    `
    );

    input.addEventListener("input", () => {
      this.form.querySelector(`[name="${input.getAttribute("name")}"]`).value =
        input.value;
    });
  }

  handleSelect() {
    const select = this.querySelector("select");

    this.form.insertAdjacentHTML(
      "beforeend",
      `
      <input type="hidden" name="${select.getAttribute("name")}" value="${
        select.value
      }" required>
    `
    );

    select.addEventListener("change", () => {
      this.form.querySelector(`[name="${select.getAttribute("name")}"]`).value =
        select.value;
    });
  }

  handleCheckboxes() {
    const name = this.querySelector('[type="checkbox"]').getAttribute("name");

    this.form.insertAdjacentHTML(
      "beforeend",
      `
      <input type="hidden" name="${name}" value="" required>
    `
    );

    const setHidden = () => {
      const inputHidden = this.form.querySelector(`[name="${name}"]`);

      const checkedValues = [
        ...this.querySelectorAll('input[type="checkbox"]:checked'),
      ].map((checkbox, index) => {
        if (index > 0) {
          return " " + checkbox.value;
        } else {
          return checkbox.value;
        }
      });
      inputHidden.value = checkedValues;
    };
    setHidden();

    this.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        setHidden();
      });
    });
  }

  handleRadios() {
    const name = this.querySelector('[type="radio"]').getAttribute("name");

    this.form.insertAdjacentHTML(
      "beforeend",
      `
      <input type="hidden" name="${name}" value="" required>
    `
    );

    const setHidden = () => {
      this.form.querySelector(`[name="${name}"]`).value = this.querySelector(
        '[type="radio"]:checked'
      ).value;
    };
    setHidden();

    this.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        setHidden();
      });
    });
  }
}
customElements.define("ml-personalization-field", MlPersonalizationField);

class MlPersonalizationFieldFileUpload extends HTMLElement {
  constructor() {
    super();

    this.loadStyleScripts();

    const vendorScript = document.querySelector(
      'script[src*="plugin-image-preview"]'
    );
    vendorScript.onload = () => {
      this.init();
    };

    window.addEventListener("eg.product.quick_view.modal_shown", () =>
      this.init()
    );
  }

  loadStyleScripts() {
    if (document.querySelector('script[src*="plugin-image-preview"]')) return;

    const style1 = document.createElement("link");
    style1.setAttribute(
      "href",
      "https://cdn.jsdelivr.net/npm/filepond@4.31.1/dist/filepond.min.css"
    );
    style1.setAttribute("rel", "stylesheet");
    style1.setAttribute(
      "integrity",
      "sha256-a95jYCBL4++k1XyLYgulKmY33bIJIVYMsJO/RNytaJM="
    );
    style1.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(style1);

    const style2 = document.createElement("link");
    style2.setAttribute(
      "href",
      "https://cdn.jsdelivr.net/npm/filepond-plugin-image-preview@4.6.12/dist/filepond-plugin-image-preview.min.css"
    );
    style2.setAttribute("rel", "stylesheet");
    style2.setAttribute(
      "integrity",
      "sha256-YsO8aMI20vSizdmc2mmWx2DU1wof4v60Nwy7hIBvdM8="
    );
    style2.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(style2);

    const script1 = document.createElement("script");
    script1.setAttribute(
      "src",
      "https://cdn.jsdelivr.net/npm/filepond@4.31.1/dist/filepond.min.js"
    );
    script1.setAttribute(
      "integrity",
      "sha256-6yXpr8+sATA4Q2ANTyZmpn4ZGP7grbIRNpe9s0Y+iO0="
    );
    script1.setAttribute("crossorigin", "anonymous");
    script1.setAttribute("defer", "defer");
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.setAttribute(
      "src",
      "https://cdn.jsdelivr.net/npm/filepond-plugin-image-preview@4.6.12/dist/filepond-plugin-image-preview.min.js"
    );
    script2.setAttribute(
      "integrity",
      "sha256-1vQHytMrpOsKFyUUPuEVhxeNH6UhMX3uNetDRvlSpwU="
    );
    script2.setAttribute("crossorigin", "anonymous");
    script1.setAttribute("defer", "defer");
    document.head.appendChild(script2);
  }

  async init() {
    await new Promise((resolve) => setTimeout(resolve, 200));

    window.FilePond.registerPlugin(window.FilePondPluginImagePreview);

    const inputElem = this.querySelector('input[type="file"]');

    const pond = window.FilePond.create(inputElem, {
      storeAsFile: true,
      labelIdle: this.querySelector("[data-label-text]").innerHTML,
    });

    pond.on("addfile", () => {
      setTimeout(() => {
        this.closest(".product")
          .querySelector(".product-form form")
          .insertAdjacentElement(
            "beforeend",
            this.querySelector(".filepond--data")
          );
      }, 1000);
    });
  }
}
customElements.define(
  "ml-personalization-field-file-upload",
  MlPersonalizationFieldFileUpload
);

// Shopify subscriptions app smal fix
document
  .querySelectorAll('.shopify_subscriptions_app_block [type="radio"]')
  .forEach((radio) => {
    radio.classList.add("bs-form-check-input");
  });
