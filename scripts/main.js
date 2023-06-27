"use strict";

import { AccountCard, AccountHandler } from "./lib/AccountCard.js";
import { FormPopup } from "./lib/Popup.js";
import { ToastManager } from "./lib/Toast.js";

console.log("main.js is connected");

const data = localStorage.getItem("data");

// Initilaize Toast manager
const toastManager = new ToastManager({
  containerId: "#toast-container",
  templateSelector: "#toast-template",
});

// Initilaize Account Handler
const accountHandler = new AccountHandler({
  parentSelector: "#account-cards",
  templateSelector: "#account-card-template",
});

try {
  if (data) {
    accountHandler.restore(JSON.parse(data));
    toastManager.createToast({
      message: "Restored Accounts Successfully",
      title: "Success!",
      type: "success",
    });
    console.log("RESTORE SUCCESSFUL");
  }
} catch (error) {
  toastManager.createToast({
    message: "Restoration Failed",
    title: "Error!",
    type: "error",
  });
  console.error("RESTORE FAILED", error);
}

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
        accountHandler.addAccount(d["name"], d["amount"], d["color"]);
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

function saveData() {
  localStorage.setItem("data", JSON.stringify(accountHandler.getState()));
  console.log("Data Saved!");
}

// // Handle window unloading
// window.addEventListener("beforeunload", (event) => {
//   event.preventDefault();
//   event.returnValue = "";
// });

document.addEventListener("keydown", (event) => {
  // Check if the "Ctrl" key and "S" key are pressed simultaneously
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    saveData();
    toastManager.createToast({
      title: "Success",
      message: "Accounts Saved Successfully!",
      type: "success",
    });
  }
});
