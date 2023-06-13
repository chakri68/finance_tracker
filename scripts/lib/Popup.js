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
        callback(success, success ? dynamicDomElement.getData() : null);
        this.remove();
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
    let template = /** @type {HTMLTemplateElement} */ (
      document.querySelector(`#dialog-template`)
    );
    let clone = /** @type {HTMLDialogElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );
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

    // Add event listeners
    clone.addEventListener("click", (event) => {
      var rect = clone.getBoundingClientRect();
      var isInDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        callback(false);
        clone.close();
      }
    });

    clone.querySelector(".actions > .save")?.addEventListener("click", () => {
      callback(true);
      clone.close();
    });

    clone.querySelector(".dialog-close").addEventListener("click", () => {
      callback(false);
      clone.close();
    });

    return clone;
  }
}
