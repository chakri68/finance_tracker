export class ToastManager {
  /**
   * @param {Object} config
   * @param {string} config.containerId
   * @param {string} [config.templateSelector="#toast-template"]
   */
  constructor({ containerId, templateSelector = "#toast-template" }) {
    this.container = document.querySelector(containerId);
    this.toasts = [];
    this.templateSelector = templateSelector;

    this.container.addEventListener("click", this.handleToastClick.bind(this));
  }

  /**
   * @param {Object} config
   * @param {string} config.title
   * @param {string} config.message
   * @param {string} [config.querySelector=this.templateSelector]
   * @param {number} [config.timeout=10000]
   * @param {"default"|"success"|"error"|"warning"} [config.type="default"]
   */
  createToast({
    title,
    message,
    querySelector = this.templateSelector,
    timeout = 10000,
    type = "default",
  }) {
    const template = /** @type {HTMLTemplateElement} */ (
      document.querySelector(querySelector)
    );
    const clone = /** @type {HTMLElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );

    const toast = new Toast(clone, { title, message, type });
    this.toasts.push(toast);

    this.container.appendChild(clone);

    // Animate the toast pop-up
    requestAnimationFrame(() => {
      clone.classList.add("pop-in");
    });

    if (timeout > 0) {
      toast.closeTimeout = setTimeout(() => {
        this.removeToast(toast);
        toast.emit("close");
      }, timeout);
    }

    return toast;
  }

  /**
   * @param {Toast} toast
   */
  removeToast(toast) {
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }

    toast.element.classList.add("fade-out");

    setTimeout(() => {
      this.container.removeChild(toast.element);
      toast.emit("close");
    }, 300);
  }

  /**
   * @param {Event} event
   */
  handleToastClick(event) {
    // @ts-ignore
    const toastElement = event.target.closest(".toast");
    if (toastElement) {
      const toast = this.getToastByElement(toastElement);
      if (toast) {
        const closeButton = toastElement.querySelector(".toast-close");
        if (event.target === closeButton) {
          this.removeToast(toast);
          toast.emit("close");
        } else {
          toast.emit("click");
        }
      }
    }
  }

  /**
   * @param {HTMLElement} element
   */
  getToastByElement(element) {
    return this.toasts.find((toast) => toast.element === element);
  }
}

export class Toast {
  /**
   * @param {HTMLElement} element
   * @param {Object} config
   * @param {string} config.title
   * @param {string} config.message
   * @param {string} config.type
   */
  constructor(element, { title, message, type }) {
    this.element = element;
    this.titleElement = element.querySelector(".toast-title");
    this.messageElement = element.querySelector(".toast-message");
    this.closeButton = element.querySelector(".toast-close");

    this.title = title;
    this.message = message;
    this.type = type;
    this.closeTimeout = null; // Declare the closeTimeout property

    this.events = {
      close: [],
      click: [],
    };

    this.titleElement.textContent = this.title;
    this.messageElement.textContent = this.message;

    this.element.classList.add(`${this.type}`);

    this.element.addEventListener(
      "animationend",
      this.handleAnimationEnd.bind(this)
    );

    this.closeButton.addEventListener(
      "click",
      this.handleCloseButtonClick.bind(this)
    );

    this.element.addEventListener("click", this.handleToastClick.bind(this));
  }

  /**
   * @param {string | number} event
   * @param {Function} callback
   */
  on(event, callback) {
    this.events[event].push(callback);
  }

  /**
   * @param {string | number} event
   * @param {Function} callback
   */
  off(event, callback) {
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  /**
   * @param {string | number} event
   */
  emit(event) {
    this.events[event].forEach((/** @type {() => any} */ callback) =>
      callback()
    );
  }

  /**
   * @param {{ animationName: string; }} event
   */
  handleAnimationEnd(event) {
    if (event.animationName === "toast-pop-in") {
      this.element.classList.remove("pop-in");
    }
  }

  handleCloseButtonClick() {
    clearTimeout(this.closeTimeout);
    this.emit("close");
  }

  handleToastClick(event) {
    const closeButton = event.target.closest(".toast-close");
    if (!closeButton) {
      this.emit("click");
    }
  }
}
