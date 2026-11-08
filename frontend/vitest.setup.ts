import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { initialState, useStore } from "@/lib/store";

// jsdom does not implement the native modal dialog.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

beforeEach(() => {
  localStorage.clear();
  useStore.setState(initialState());
});

afterEach(() => cleanup());
