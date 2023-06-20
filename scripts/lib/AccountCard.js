import { DynamicDOMElement } from "./Form.js";

/**
 * @typedef {object} AccountCardProps
 * @property {string} templateSelector
 * @property {string} name
 * @property {number} amount
 * @property {string} color
 */

export class AccountCard {
  /**
   * Represents an account card
   * @param {string} name
   * @param {number} amount
   * @param {string} color
   * @param {string?} [templateSelector]
   * @property {string?} [parentSelector] Selector for parent (Inserts the element into the DOM tree if specified)
   */
  constructor(
    name,
    amount,
    color,
    templateSelector = "#account-card-template",
    parentSelector = null
  ) {
    this.name = name;
    this.amount = amount;
    this.color = color;
    this.templateSelector = templateSelector;
    this.parentSelector = parentSelector;
    this.domElement = AccountCardGenerator.generate({
      name,
      amount,
      color,
      templateSelector,
    });
    this.domElement.style.setProperty("--data-accent-color", this.color);
    if (parentSelector)
      document.querySelector(parentSelector).appendChild(this.domElement);
  }
}

export class AccountCardGenerator {
  /**
   * @param {AccountCardProps} props Props for the account card
   */
  static generate({ name, amount, color, templateSelector }) {
    let template = /** @type {HTMLTemplateElement} */ (
      document.querySelector(templateSelector)
    );
    let accountCard = /** @type {HTMLElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );
    let accountTitle = /** @type {HTMLElement} */ (
      accountCard.querySelector(".account-title")
    );
    accountTitle.innerText = name;
    let accountAmount = /** @type {HTMLElement} */ (
      accountCard.querySelector(".account-amount")
    );
    accountAmount.innerText = amount.toString();
    return accountCard;
  }
}
