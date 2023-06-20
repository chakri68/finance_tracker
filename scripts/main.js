"use strict";

import { Form, FormGenerator } from "./lib/Form.js";
import { FormField, FormFieldGenerator } from "./lib/FormFields.js";
import { FormPopup, Popup } from "./lib/Popup.js";

console.log("main.js is connected");

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
      if (s) console.log("NEW ACCOUNT", { d });
    }
  ).domElement.showModal();
});

const deleteAccountBtn = document.getElementById("delete-account");
const transactionDialog = document.getElementById("transaction-dialog");

// Account Cards Setup
const accountCards = document.getElementById("account-cards");

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
