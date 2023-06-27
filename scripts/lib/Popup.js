import { DynamicDOMElement, Form } from "./Form.js";
import { FormField, parseFormFieldArray } from "./FormFields.js";

/**
 * @callback popupCallback
 * @param {boolean} success
 * @param {any} data
 */

/**
 * @callback closePopupCallback
 * @param {boolean} success
 */

// TODO: Make title, subtitle optional
export class Popup {
  /**
   * @param {string} title
   * @param {string} subtitle
   * @param {DynamicDOMElement} dynamicDomElement
   * @param {popupCallback} callback
   * @param {string?} parentSelector
   */
  constructor(
    title,
    subtitle,
    dynamicDomElement,
    callback,
    parentSelector = "div#popups"
  ) {
    this.callback = callback;
    this.domElement = PopupGenerator.generate({
      title,
      subtitle,
      domElement: dynamicDomElement.domElement,
      callback: (success) => {
        this.domElement.classList.add("closing");
        setTimeout(() => {
          this.domElement.close();
          callback(success, success ? dynamicDomElement.getData() : null);
          this.remove();
        }, 300); // 300 is 0.3ms -> Time for the dialogClose animation
      },
    });
    document.querySelector(parentSelector).appendChild(this.domElement);
  }

  remove() {
    this.domElement.remove();
  }
}

export class PopupGenerator {
  /**
   * Generate a popup dialog.
   *
   * @param {Object} config Configuration object for generating the popup.
   * @param {string} config.title Title for the dialog.
   * @param {string} [config.subtitle] Subtitle for the dialog.
   * @param {HTMLElement} config.domElement The element to be displayed in the dialog.
   * @param {boolean} [config.includeActions=true] Flag to include action buttons.
   * @param {string} [config.saveButtonText="Save"] Text for the save button.
   * @param {string} [config.cancelButtonText="Cancel"] Text for the cancel button.
   * @param {closePopupCallback} [config.callback] The callback to be called when the dialog is closed.
   * @returns {HTMLDialogElement} The generated popup dialog element.
   */
  static generate({
    title,
    subtitle = "",
    domElement,
    includeActions = true,
    saveButtonText = "Save",
    cancelButtonText = "Cancel",
    callback,
  }) {
    if (!callback)
      callback = () => {
        clone.classList.add("closing");
        setTimeout(() => {
          clone.close();
          clone.remove();
        }, 300); // 300 is 0.3ms -> Time for the dialogClose animation
      };

    const save = () => {
      if (callback) callback(true);
    };

    const cancel = () => {
      callback(false);
    };

    const template = /** @type {HTMLTemplateElement} */ (
      document.querySelector(`#dialog-template`)
    );
    const clone = /** @type {HTMLDialogElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );
    clone.classList.add("dynamic-popup");
    const titleEl = /** @type {HTMLElement} */ (clone.querySelector(".title"));
    const subtitleEl = /** @type {HTMLElement} */ (
      clone.querySelector(".subtitle")
    );
    const contentEl = /** @type {HTMLElement} */ (
      clone.querySelector(".content")
    );
    const actionsEl = /** @type {HTMLElement} */ (
      clone.querySelector(".actions")
    );
    titleEl.innerText = title;
    subtitleEl.innerText = subtitle;
    contentEl.appendChild(domElement);

    if (includeActions) {
      const saveBtn = document.createElement("button");
      const cancelBtn = document.createElement("button");
      saveBtn.classList.add("action-btn", "primary-btn");
      saveBtn.innerText = saveButtonText;
      cancelBtn.innerText = cancelButtonText;
      cancelBtn.classList.add("action-btn", "secondary-btn");
      saveBtn.addEventListener("click", save);
      cancelBtn.addEventListener("click", cancel);
      actionsEl.appendChild(cancelBtn);
      actionsEl.appendChild(saveBtn);
    }

    clone.addEventListener("click", (event) => {
      const rect = clone.getBoundingClientRect();
      const isInDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        cancel();
      }
    });

    clone.querySelector(".actions > .save")?.addEventListener("click", () => {
      save();
    });

    clone.querySelector(".dialog-close").addEventListener("click", () => {
      cancel();
    });

    return clone;
  }
}

export class FormPopup extends Popup {
  /**
   * @param {string} title
   * @param {string} subtitle
   * @param {Array<import("./FormFields.js").FormFieldLike>} formFields
   * @param {popupCallback} callback
   * @param {string?} parentSelector
   */
  constructor(
    title,
    subtitle,
    formFields,
    callback,
    parentSelector = "div#popups"
  ) {
    let form = new Form(parseFormFieldArray(formFields));
    super(title, subtitle, form, callback, parentSelector);
  }
}
