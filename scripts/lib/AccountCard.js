import { PopupGenerator } from "./Popup.js";

/**
 * @typedef AccountHandlerState
 * @property {AccountCardState[]} accounts
 */

/**
 * @typedef AccountCardState
 * @property {string} name
 * @property {number} amount
 * @property {string} color
 * @property {Transaction[]} transactions
 */

/**
 * @typedef Transaction
 * @property {string} operation
 * @property {number} amount
 * @property {string} timestamp
 */

/**
 * Represents an account handler.
 */
export class AccountHandler {
  /**
   * Creates an instance of AccountHandler.
   * @param {object} config - Configuration object.
   * @param {string} config.parentSelector - Parent selector for the account cards.
   * @param {string} config.templateSelector - Template selector for the account card template.
   */
  constructor(config) {
    /** @type {Array<AccountCard>} */
    this.accounts = [];
    this.parentSelector = config.parentSelector;
    this.templateSelector = config.templateSelector;
    this.parentElement = document.querySelector(this.parentSelector);
  }

  /**
   * Add an account to the account handler.
   * @param {string} name - Name of the account.
   * @param {number} amount - Initial amount of the account.
   * @param {string} color - Color of the account.
   */
  addAccount(name, amount, color) {
    const accountCard = new AccountCard({
      name,
      amount,
      color,
      templateSelector: this.templateSelector,
    });
    accountCard.onDelete = (deletedCard) => {
      this.deleteAccount(deletedCard);
    };
    this.accounts.push(accountCard);
    this.parentElement.appendChild(accountCard.domElement);
  }

  /**
   * Delete an account from the account handler.
   * @param {AccountCard} deletedCard - The account card to be deleted.
   */
  deleteAccount(deletedCard) {
    const index = this.accounts.indexOf(deletedCard);
    if (index !== -1) {
      this.accounts.splice(index, 1);
      // Remove the account card element from the DOM
      deletedCard.domElement.remove();
    }
  }

  /**
   * Get all the accounts in the account handler.
   * @returns {Array<AccountCard>} - The accounts.
   */
  getAccounts() {
    return this.accounts;
  }

  /**
   * Returns the account handler state.
   */
  getState() {
    const accounts = this.accounts.map((account) => account.getState());
    return {
      accounts: accounts,
    };
  }

  /**
   * Restores the account handler state from a JSON string.
   * @param {AccountHandlerState} state - The JSON string representing the state.
   */
  restore(state) {
    if (state && state.accounts && Array.isArray(state.accounts)) {
      this.accounts = state.accounts.map((serializedAccount) =>
        AccountCard.fromState(serializedAccount)
      );
      this.accounts.forEach((account) => {
        this.parentElement.appendChild(account.domElement);
        account.onDelete = (deletedCard) => {
          this.deleteAccount(deletedCard);
        };
      });
    }
  }
}

/**
 * Represents an account card.
 */
export class AccountCard {
  /**
   * Creates an instance of AccountCard.
   * @param {object} config - Configuration object.
   * @param {string} config.name - Name of the account.
   * @param {number} config.amount - Initial amount of the account.
   * @param {string} config.color - Color of the account.
   * @param {Transaction[]} [config.transactions=[]] - Transactions of the account.
   * @param {string} [config.templateSelector="#account-card-template"] - Template selector for the account card template.
   */
  constructor({
    name,
    amount,
    color,
    transactions = [],
    templateSelector = "#account-card-template",
  }) {
    this.setupDOMElements(templateSelector); // IMP: setup the DOM elements first

    this.name = name;
    // @ts-ignore
    this.amount = parseFloat(amount);
    this.expenses = 0;
    this.income = 0;
    this.color = color;
    this.domElement.style.setProperty("--data-accent-color", this.color);
    this.templateSelector = templateSelector;
    this.transactions = transactions;
    this.onDelete = null;
  }

  /**
   * Sets up all the DOM elements and events
   * @param {string} selector - The template selector.
   */
  setupDOMElements(selector) {
    let template = /** @type {HTMLTemplateElement} */ (
      document.querySelector(selector)
    );
    let accountCard = /** @type {HTMLElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );

    this.domElement = accountCard;

    this.amountElement = /** @type {HTMLElement} */ (
      accountCard.querySelector(".current-amount")
    );
    /** @type {HTMLElement} */
    this.incomeElement = accountCard.querySelector(".account-income");

    /** @type {HTMLElement} */
    this.expensesElement = accountCard.querySelector(".account-expenses");

    /** @type {HTMLElement} */
    this.deleteButton = accountCard.querySelector(".delete-button");

    /** @type {HTMLElement} */
    this.historyButton = accountCard.querySelector(".history-button");

    /** @type {HTMLInputElement} */
    this.amountInput = accountCard.querySelector(".amount-input");

    /** @type {HTMLElement} */
    this.plusButton = accountCard.querySelector(".plus");

    /** @type {HTMLElement} */
    this.minusButton = accountCard.querySelector(".minus");

    this.accountTitle = /** @type {HTMLElement} */ (
      accountCard.querySelector(".account-title")
    );

    this.amountElement = /** @type {HTMLElement} */ (
      accountCard.querySelector(".current-amount")
    );

    this.deleteButton.addEventListener("click", () => {
      this.handleDelete();
    });

    this.historyButton.addEventListener("click", () => {
      this.showTransactionHistory();
    });

    this.plusButton.addEventListener("click", () => {
      this.handleAmountUpdate("plus");
    });

    this.minusButton.addEventListener("click", () => {
      this.handleAmountUpdate("minus");
    });
  }

  /**
   * Handles the delete event for the account card.
   */
  handleDelete() {
    if (this.onDelete) {
      this.onDelete(this);
    }
  }

  /**
   * Handles the amount update for the account card.
   * @param {"plus"|"minus"} operation - The operation to perform (either "plus" or "minus").
   */
  handleAmountUpdate(operation) {
    const inputValue = parseFloat(this.amountInput.value);
    if (isNaN(inputValue)) {
      return;
    }

    if (operation === "plus") {
      this.amount += inputValue;
      this.income += inputValue;
    } else if (operation === "minus") {
      this.amount -= inputValue;
      this.expenses += inputValue;
    }

    this.amountInput.value = "";

    // Add transaction to the transactions history
    this.transactions.push({
      operation,
      amount: inputValue,
      timestamp: new Date().toISOString(),
    });
  }

  showTransactionHistory() {
    if (this.transactions.length === 0) {
      console.warn("No transactions found.");
      return;
    }

    const dialogTitle = `${this.name} Transaction History`;
    const dialogSubtitle = "List of transactions";

    // Get the transaction history template
    const template = /** @type {HTMLTemplateElement} */ (
      document.querySelector("#transaction-history-table-template")
    );
    const clone = /** @type {HTMLTableElement} */ (
      template.content.firstElementChild.cloneNode(true)
    );

    // Get the table body to append transaction rows
    const tableBody = /** @type {HTMLElement} */ (clone.querySelector("tbody"));

    // Create transaction rows
    this.transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      const dateCell = document.createElement("td");
      dateCell.innerText = transaction.timestamp;
      const amountCell = document.createElement("td");
      amountCell.innerText = transaction.amount.toString();
      const typeCell = document.createElement("td");
      typeCell.innerText = transaction.operation;

      if (transaction.operation === "plus") {
        row.classList.add("positive");
      } else if (transaction.operation === "minus") {
        row.classList.add("negative");
      }

      row.appendChild(dateCell);
      row.appendChild(amountCell);
      row.appendChild(typeCell);
      tableBody.appendChild(row);
    });

    // Generate the popup dialog using PopupGenerator
    const popup = PopupGenerator.generate({
      title: dialogTitle,
      subtitle: dialogSubtitle,
      domElement: clone,
      includeActions: false,
    });

    // Append the popup dialog to the DOM
    document.body.appendChild(popup);
    popup.showModal();
  }

  /**
   * Returns the account card state.
   * @returns {AccountCardState} - The account card state.
   */
  getState() {
    return {
      name: this.name,
      amount: this.amount,
      color: this.color,
      transactions: this.transactions,
    };
  }

  /**
   * Creates an account card from the account card state.
   * @param {AccountCardState} state - The account card state.
   * @returns {AccountCard} - The account card.
   */
  static fromState(state) {
    const { name, amount, color, transactions } = state;
    const accountCard = new AccountCard({ name, amount, color });
    accountCard.transactions = transactions || [];
    let inc = 0,
      exp = 0;
    accountCard.transactions.forEach((transaction) => {
      if (transaction.operation === "plus") {
        inc += transaction.amount;
      } else if (transaction.operation === "minus") {
        exp += transaction.amount;
      }
    });
    accountCard.income = inc;
    accountCard.expenses = exp;
    return accountCard;
  }

  // Getters and Setters
  set amount(amount) {
    this._amount = amount;
    this.amountElement.innerText = amount.toString();
  }
  get amount() {
    return this._amount;
  }

  set income(income) {
    this._income = income;
    this.incomeElement.innerText = income.toString();
  }
  get income() {
    return this._income;
  }

  set expenses(expenses) {
    this._expenses = expenses;
    this.expensesElement.innerText = expenses.toString();
  }
  get expenses() {
    return this._expenses;
  }

  set title(title) {
    this._title = title;
    this.accountTitle.innerText = title;
  }
  get title() {
    return this._title;
  }
}
