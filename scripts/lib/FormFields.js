/**
 * @typedef {Object} FormFieldLike
 * @property {string} name Name of the field
 * @property {string} id ID of the field
 * @property {string} type Type of the form field
 * @property {string} label Label for the form field
 * @property {string?} [placeholder] Placeholder for the form field
 * @property {boolean?} [required] Is the form field required
 * @property {string?} [parentSelector] Is the form field required
 */

/**
 * @class FormField
 * @description Represents a form field
 */
export class FormField {
  /**
   * Represents a form field
   * @param {string} name Name of the field
   * @param {string} id ID of the field
   * @param {string} type Type of the form field
   * @param {string} label Label for the form field
   * @param {string?} placeholder Placeholder for the form field
   * @param {boolean?} required Is the form field required
   * @param {string?} parentSelector Is the form field required
   */
  constructor(
    name,
    id,
    type,
    label,
    placeholder = "",
    required = false,
    parentSelector = null
  ) {
    this.name = name;
    this.id = id;
    this.type = type;
    this.label = label;
    this.placeholder = placeholder;
    this.required = required;
    this.domElement = FormFieldGenerator.generate(this);
    if (parentSelector)
      document.querySelector(parentSelector).appendChild(this.domElement);
  }

  getValue() {
    // @ts-ignore
    return this.domElement.value;
  }
}

/**
 * @class FormFieldHTMLGenerator
 * @description Generates HTML for a form field using a template defined in HTML
 */
export class FormFieldGenerator {
  /**
   * @param {FormField} formField
   */
  static generate(formField) {
    switch (formField.type) {
      case "select":
        let template = /** @type {HTMLTemplateElement} */ (
          document.querySelector(`#${formField.type}.form-field-template`)
        );
        let clone = /** @type {HTMLElement} */ (
          template.content.firstElementChild.cloneNode(true)
        );
        let label = /** @type {HTMLLabelElement} */ (
          clone.querySelector(".label")
        );
        let input = /** @type {HTMLSelectElement} */ (
          clone.querySelector(".input")
        );
        input.name = formField.name;
        input.required = formField.required;
        input.id = formField.id;
        label.innerText = formField.label;
        label.htmlFor = formField.id;
        return clone;
      default:
        try {
          let template = /** @type {HTMLTemplateElement} */ (
            document.querySelector(`#default.form-field-template`)
          );
          let clone = /** @type {HTMLElement} */ (
            template.content.firstElementChild.cloneNode(true)
          );
          let label = /** @type {HTMLLabelElement} */ (
            clone.querySelector(".label")
          );
          let input = /** @type {HTMLInputElement} */ (
            clone.querySelector(".input")
          );
          input.type = formField.type;
          input.name = formField.name;
          input.id = formField.id;
          input.placeholder = formField.placeholder;
          input.required = formField.required;
          label.innerText = formField.label;
          label.htmlFor = formField.id;
          return clone;
        } catch (err) {
          console.error(
            `Error while generating HTML ELement for ${formField}: ${err}`
          );
        }
    }
  }
}

/**
 * @param {Array<FormFieldLike>} formFieldLikeArray Array of form fields objects
 */
export function parseFormFieldArray(formFieldLikeArray) {
  return formFieldLikeArray.map(
    (field) =>
      new FormField(
        field.name,
        field.id,
        field.type,
        field.label,
        field.placeholder || undefined,
        field.required || undefined,
        field.parentSelector || undefined
      )
  );
}
