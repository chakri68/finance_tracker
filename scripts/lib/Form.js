import { FormField } from "./FormFields.js";

export class DynamicDOMElement {
  /**
   * @param {HTMLElement} domElement The element this DynamicDOMElement is bound to
   * @param {string?} parentSelector
   */
  constructor(domElement, parentSelector = null) {
    this.domElement = domElement;
    if (parentSelector)
      document.querySelector(parentSelector).appendChild(this.domElement);
  }

  getData() {
    return null;
  }

  remove() {
    this.domElement.remove();
  }
}

export class Form extends DynamicDOMElement {
  /**
   * @param {Array<FormField>} formFields
   */
  constructor(formFields) {
    super(FormGenerator.generate(formFields));
    this.formFields = formFields;
  }

  getData() {
    let data = {};
    this.formFields.forEach((formField) => {
      data[formField.name] = formField.getValue();
    });
    return data;
  }
}

/**
 * @class FormGenerator
 * @description Generates HTML for a form using a template defined in HTML
 */
export class FormGenerator {
  /**
   * @param {Array<FormField>} formFields
   */
  static generate(formFields) {
    let template = /** @type {HTMLTemplateElement} */ (
      document.querySelector(`#form-template`)
    );
    let clone = /** @type {HTMLElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );
    formFields.forEach((formField) => {
      clone.appendChild(formField.domElement);
    });
    return clone;
  }
}
