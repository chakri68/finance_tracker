"use strict";

/**
 * @typedef StoredAccountCard
 * @property {string} name
 * @property {number} amount
 * @property {string} color
 */

import { AccountCard } from "./lib/AccountCard.js";
import { FormPopup } from "./lib/Popup.js";

console.log("main.js is connected");

// Account Cards Setup
/**
 * @type {Array<AccountCard>}
 */
const accountCards = [];

/**
 * @type {Array<StoredAccountCard>}
 */
const data = JSON.parse(localStorage.getItem("data") || "[]");

data.forEach((card) => {
  accountCards.push(
    new AccountCard(
      card.name,
      card.amount,
      card.color,
      "#account-card-template",
      "#account-cards"
    )
  );
});

const html = String.raw;

// Pre-made Dialogs
document
  .querySelectorAll("dialog:not(.dynamic-dialog)")
  .forEach((/** @type {HTMLDialogElement} */ dialog) => {
    dialog.querySelector(".dialog-close").addEventListener("click", () => {
      dialog.close();
    });
    dialog.querySelector(".actions > .save")?.addEventListener("click", () => {
      createAccount(getFormData(`#${dialog.id}`));
      dialog.close();
    });
    dialog.addEventListener("click", (event) => {
      var rect = dialog.getBoundingClientRect();
      var isInDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        dialog.close();
      }
    });
  });

// Toolbar Setup
const addAccountBtn = document.getElementById("add-account");
addAccountBtn.addEventListener("click", () => {
  new FormPopup(
    "Add Account",
    "",
    [
      {
        id: "account-name",
        label: "Account Name",
        name: "name",
        type: "text",
        placeholder: "lorem ipsum",
        required: true,
      },
      {
        id: "account-amount",
        label: "Amount",
        name: "amount",
        type: "number",
        placeholder: "0.0",
        required: false,
      },
      {
        id: "account-color",
        label: "Accent Color",
        name: "color",
        type: "color",
        placeholder: "red",
        required: false,
      },
    ],
    (s, d) => {
      if (s) {
        accountCards.push(
          new AccountCard(
            d["name"],
            d["amount"],
            d["color"],
            "#account-card-template",
            "#account-cards"
          )
        );
      }
    }
  ).domElement.showModal();
});

// Utility Functions
/**
 * Returns values of input elements in the dialog with the specified id
 * @param {string} selector
 * @returns {Object<string, any>}
 */
const getFormData = (selector) => {
  let res = {};
  console.log({
    selector,
    finalSelector: `${selector} input`,
    elements: document.querySelectorAll(`${selector} input`),
  });
  document
    .querySelectorAll(`${selector} input`)
    .forEach((/** @type {HTMLInputElement | HTMLSelectElement} */ el) => {
      res[el.name] = el.value;
    });
  return res;
};

/**
 * Creates a new account card and inserts it into the DOM
 * @param {Object<string, string>} account
 */
const createAccount = (account) => {
  if ("content" in document.createElement("template")) {
    const template = /** @type {HTMLTemplateElement} */ (
      document.getElementById("account-card-template")
    );
    const clone = template.content.firstElementChild.cloneNode(true);
  } else {
    console.error("Your browser does not support templates");
  }
};

document.getElementById("trial").addEventListener("click", () => {
  new FormPopup(
    "SCAM",
    "HEHE",
    [
      {
        id: "my_id",
        label: "Name",
        name: "name",
        type: "text",
      },
      {
        id: "my_id",
        label: "Age",
        name: "age",
        type: "number",
      },
    ],
    (success, data) => {
      console.log({ success, data });
    }
  ).domElement.showModal();
});

// Handle window unloading
window.addEventListener("beforeunload", () => {
  alert(
    "You have unsaved data. Please save them before you exit to prevent any progress"
  );
});

document.addEventListener("keydown", (event) => {
  // Check if the "Ctrl" key and "S" key are pressed simultaneously
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    const jsonData = JSON.stringify(
      accountCards.map((card) => {
        const { domElement, ...props } = card;
        return props;
      })
    );
    localStorage.setItem("data", jsonData);
    console.log("Data Saved!");
  }
});
