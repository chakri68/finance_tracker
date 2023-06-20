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
    this.domElement = PopupGenerator.generate(
      title,
      subtitle,
      dynamicDomElement.domElement,
      (success) => {
        this.domElement.classList.add("closing");
        setTimeout(() => {
          this.domElement.close();
          callback(success, success ? dynamicDomElement.getData() : null);
          this.remove();
        }, 300); // 300 is 0.3ms -> Time for the dialogClose animation
      }
    );
    document.querySelector(parentSelector).appendChild(this.domElement);
  }

  remove() {
    this.domElement.remove();
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

export class PopupGenerator {
  /**
   *
   * @param {string} title Title for the Dialog
   * @param {string} subtitle Subtitle for the dialog
   * @param {HTMLElement} domElement The element to be displayed in the dialog
   * @param {closePopupCallback} callback The callback to be called when the dialog is closed
   */
  static generate(title, subtitle, domElement, callback) {
    const save = () => {
      callback(true);
    };

    const cancel = () => {
      callback(false);
    };

    let template = /** @type {HTMLTemplateElement} */ (
      document.querySelector(`#dialog-template`)
    );
    let clone = /** @type {HTMLDialogElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );
    clone.classList.add("dynamic-popup");
    let titleEl = /** @type {HTMLElement} */ (clone.querySelector(".title"));
    let subtitleEl = /** @type {HTMLElement} */ (
      clone.querySelector(".subtitle")
    );
    let contentEl = /** @type {HTMLElement} */ (
      clone.querySelector(".content")
    );
    let actionsEl = /** @type {HTMLElement} */ (
      clone.querySelector(".actions")
    );
    titleEl.innerText = title;
    subtitleEl.innerText = subtitle;
    contentEl.appendChild(domElement);

    // create some default actions
    const saveBtn = document.createElement("button");
    const cancelBtn = document.createElement("button");
    saveBtn.classList.add("action-btn", "primary-btn");
    saveBtn.innerText = "Save";
    cancelBtn.innerText = "Cancel";
    cancelBtn.classList.add("action-btn", "secondary-btn");
    saveBtn.addEventListener("click", save);
    cancelBtn.addEventListener("click", cancel);
    actionsEl.appendChild(cancelBtn);
    actionsEl.appendChild(saveBtn);

    // Add event listeners
    clone.addEventListener("click", (event) => {
      var rect = clone.getBoundingClientRect();
      var isInDialog =
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
