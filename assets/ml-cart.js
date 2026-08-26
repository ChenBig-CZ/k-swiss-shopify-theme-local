/*
  Cart collapses - scroll to element
*/
window.mlCartDrawerFixScrollPosition = () => {
  setTimeout(() => {
    const wrapper = document.querySelector(".ml-cart-drawer-wrapper");
    wrapper.scroll({ top: wrapper.scrollHeight, behavior: "smooth" });
  }, 250);
};

/*
  Cart goal
*/
class MlCartGoal extends HTMLElement {
  constructor() {
    super();

    this.progressBar = this.querySelector(".bs-progress-bar");
    this.animateProgressBar();
    this.initConfetti();
  }

  animateProgressBar() {
    setTimeout(() => {
      this.progressBar.style.width = this.progressBar.dataset.width;
    }, 250);
  }

  async initConfetti() {
    if (this.dataset.showConfetti === "false") return;

    const goalCompleted = Number(this.dataset.goalCompleted);
    const prevGoalCompleted = Number(
      localStorage.getItem("ml-cart-goal-completed") || 0
    );

    if (prevGoalCompleted !== goalCompleted) {
      localStorage.setItem("ml-cart-goal-completed", goalCompleted);
    }

    if (goalCompleted <= prevGoalCompleted) return;

    const myCanvas = document.createElement("canvas");
    myCanvas.setAttribute("id", "ml-cart-goal-confetti-canvas");

    if (this.closest(".cart-drawer")) {
      this.closest(".cart-drawer")
        .querySelector(".drawer__inner")
        .insertAdjacentElement("afterbegin", myCanvas);
    }

    const myConfetti = window.confetti.create(myCanvas);

    myConfetti({
      particleCount: 400,
      spread: 90,
    });

    setTimeout(() => {
      myCanvas.remove();
    }, 4000);
  }
}
customElements.define("ml-cart-goal", MlCartGoal);

/*
  Cart upsells
*/
class MlCartUpsells extends HTMLElement {
  constructor() {
    super();

    this.querySelectorAll('select[name="id"]').forEach((select) => {
      select.addEventListener("change", (event) => {
        event.preventDefault();
        const imgSrc = select.options[select.selectedIndex].dataset.variantImg;

        if (imgSrc) {
          const img = select
            .closest(".ml-cart-upsell-item")
            .querySelector(".ml-cart-upsell-item-image img");
          img.src = imgSrc;
        }
      });
    });
  }
}
customElements.define("ml-cart-upsells", MlCartUpsells);

/*
  Shipping calculator
*/
class MlCartShippingCalculator extends HTMLElement {
  constructor() {
    super();

    this.country = this.querySelector("#ml-shipping-calculator-country");
    this.province = this.querySelector("#ml-shipping-calculator-province");
    this.zip = this.querySelector("#ml-shipping-calculator-zip");
    this.alert = this.querySelector("#ml-shipping-calculator-alert");
    this.btn = this.querySelector("button");

    this.initCommonJsScript();
    this.btn.addEventListener("click", this.onSubmit.bind(this));
  }

  async initCommonJsScript() {
    const script = document.createElement("script");
    script.src = this.dataset.shopifyCommonJs;
    document.head.appendChild(script);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    new window.Shopify.CountryProvinceSelector(
      "ml-shipping-calculator-country",
      "ml-shipping-calculator-province",
      {
        hideElement: "ml-shipping-calculator-province-wrapper",
      }
    );

    this.country.options[0].textContent =
      this.country.getAttribute("aria-label");

    this.insertCustomerData();
  }

  insertCustomerData() {
    const country = this.dataset.customerCountry;
    const province = this.dataset.customerProvince;
    const zip = this.dataset.customerZip;

    if (country.length) {
      this.querySelector("#ml-shipping-calculator-country").value = country;
      this.querySelector("#ml-shipping-calculator-country").dispatchEvent(
        new CustomEvent("change")
      );
      if (province.length) {
        this.querySelector("#ml-shipping-calculator-province").value = province;
      }
      if (zip.length) {
        this.querySelector("#ml-shipping-calculator-zip").value = zip;
      }
    }
  }

  async onSubmit() {
    this.btn.classList.add("loading");
    this.btn.querySelector(".loading__spinner").classList.remove("hidden");

    const prepareResponse = await fetch(
      `/cart/prepare_shipping_rates.json?shipping_address[zip]=${this.zip.value}&shipping_address[country]=${this.country.value}&shipping_address[province]=${this.province.value}`,
      {
        method: "POST",
      }
    );
    console.log(prepareResponse);

    if (prepareResponse.ok) {
      const asyncResponse = await fetch(
        `/cart/async_shipping_rates.json?shipping_address[zip]=${this.zip.value}&shipping_address[country]=${this.country.value}&shipping_address[province]=${this.province.value}`
      );
      console.log(asyncResponse);

      const data = await asyncResponse.json();
      console.log(data);

      let list = "";

      if (data.shipping_rates.length) {
        data.shipping_rates.forEach((elem) => {
          list += `
            <li>
              <strong>${elem.presentment_name}</strong>: ${elem.price} ${elem.currency}
            </li>
          `;
        });

        this.alert.innerHTML = `
          <ul class="">
            ${list}
          </ul>
        `;
        this.alert.classList.remove("ml-alert-danger", "ml-alert-warning");
        this.alert.classList.add("ml-alert-success");
        this.alert.removeAttribute("hidden");
      } else {
        this.alert.innerHTML = `
          <p class="">
            ${this.dataset.textNoResultsFound}
          </p>
        `;
        this.alert.classList.remove("ml-alert-danger", "ml-alert-success");
        this.alert.classList.add("ml-alert-warning");
        this.alert.removeAttribute("hidden");
      }
    } else {
      const data = await prepareResponse.json();
      console.log(data);

      let list = "";

      for (const [key, value] of Object.entries(data)) {
        list += `
          <li>
            <b>${key}</b>: ${value.toString()}
          </li>
        `;
      }

      this.alert.innerHTML = `
        <ul class="">
          ${list} 
        </ul>
      `;
      this.alert.classList.remove("ml-alert-success", "ml-alert-warning");
      this.alert.classList.add("ml-alert-danger");
      this.alert.removeAttribute("hidden");
    }

    this.btn.classList.remove("loading");
    this.btn.querySelector(".loading__spinner").classList.add("hidden");
  }
}
customElements.define("ml-cart-shipping-calculator", MlCartShippingCalculator);

/*
  Cart discount form
*/
class MlCartDiscountForm extends HTMLElement {
  constructor() {
    super();

    this.form = this.querySelector("form");
    this.input = this.querySelector("input");
    this.btn = this.querySelector("button");
    this.form.addEventListener("submit", this.onSubmit.bind(this));

    this.querySelectorAll('.discounts button').forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        this.removeDiscount();
      });
    });
  }

  async onSubmit(event) {
    event.preventDefault();
    if (!this.input.value.length) return

    this.btn.classList.add("loading");
    this.btn.querySelector(".loading__spinner").classList.remove("hidden");

    const cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    let sections = cart.getSectionsToRender().map((section) => section.id);
    
    const response = await fetch(`${this.form.action}.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [this.input.name]: this.input.value,
        sections,
      }),
    });

    console.log(response);
    const data = await response.json();
    console.log(data);

    this.btn.classList.remove("loading");
    this.btn.querySelector(".loading__spinner").classList.add("hidden");
    
    const isApplicable = data.discount_codes[0]?.applicable;
    
    if (isApplicable) {
      cart.renderContents(data);

      if (cart && cart.classList.contains("is-empty"))
        cart.classList.remove("is-empty");
    } else {
      const alert = this.querySelector(".ml-alert");
      alert.hidden = false;
    }
  }

  async removeDiscount() {
    this.btn.classList.add("loading");
    this.btn.querySelector(".loading__spinner").classList.remove("hidden");

    const cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    let sections = cart.getSectionsToRender().map((section) => section.id);

    const response = await fetch(`${this.form.action}.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [this.input.name]: '',
        sections,
      }),
    });

    console.log(response);
    const data = await response.json();
    console.log(data);

    cart.renderContents(data);

    if (cart && cart.classList.contains("is-empty"))
      cart.classList.remove("is-empty");

    this.btn.classList.remove("loading");
    this.btn.querySelector(".loading__spinner").classList.add("hidden");
  }
}
customElements.define("ml-cart-discount-form", MlCartDiscountForm);

/*
  Upgrade to subscription
*/
class MlCartSubUpgradeSelector extends HTMLElement {
  constructor() {
    super();

    this.select = this.querySelector("select");
    this.select.addEventListener("change", this.onChange.bind(this));
  }

  async onChange(event) {
    event.preventDefault();
    const cartItems =
      this.closest("cart-items") || this.closest("cart-drawer-items");
    await cartItems.updateQuantity(this.dataset.index, 0, event);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    let sections = cart.getSectionsToRender().map((section) => section.id);

    const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          {
            id: Number(this.dataset.variantId),
            quantity: Number(this.dataset.quantity),
            selling_plan: Number(this.select.value),
          },
        ],
        sections,
      }),
    });
    const responseData = await response.json();
    cart.renderContents(responseData);

    if (cart && cart.classList.contains("is-empty"))
      cart.classList.remove("is-empty");
  }
}
customElements.define("ml-cart-sub-upgrade-selector", MlCartSubUpgradeSelector);

/*
  Delivery calendar
*/
class MlCartDeliveryCalendar extends HTMLElement {
  constructor() {
    super();

    this.injectVendorFiles();
    this.init();

    const script = document.querySelector('script[src*="vanilla-calendar"]');
    script.onload = () => {
      this.init();
    };
  }

  async injectVendorFiles() {
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", this.dataset.vendorCssFile);
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.setAttribute("src", this.dataset.vendorJsFile);
    document.head.appendChild(script);
  }

  async init() {
    if (!window.VanillaCalendar) return;

    const cartResponse = await fetch(`${window.routes.cart_url}.js`);
    const cart = await cartResponse.json();
    const deliveryDate = cart.attributes.delivery_date;

    const calendar = new window.VanillaCalendar(
      this.querySelector(".ml-cart-delivery-calendar-div"),
      {
        type: "default",
        settings: {
          lang: "en-US",
          selected: {
            dates: [deliveryDate],
          },
          visibility: {
            theme: "light",
          },
        },
        date: {
          min: "today",
        },
        actions: {
          clickDay: async (event, self) => {
            const deliveryDate = self.selectedDates[0] || "";

            this.setAlert(deliveryDate);

            await fetch(`${window.routes.cart_update_url}.js`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                attributes: {
                  delivery_date: deliveryDate,
                },
              }),
            });
          },
        },
      }
    );
    calendar.init();

    this.setAlert(deliveryDate);
  }

  setAlert(deliveryDate) {
    const alert = this.querySelector(".ml-alert");

    if (deliveryDate && deliveryDate.length) {
      alert.innerHTML = `${alert.dataset.textDeliveryDate}: <b>${deliveryDate}</b>`;
      alert.classList.add("ml-alert-success");
      alert.classList.remove("ml-alert-info");
    } else {
      alert.innerHTML = alert.dataset.textInit;
      alert.classList.remove("ml-alert-success");
      alert.classList.add("ml-alert-info");
    }
  }
}
customElements.define("ml-cart-delivery-calendar", MlCartDeliveryCalendar);
