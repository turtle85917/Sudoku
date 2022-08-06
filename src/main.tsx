import React from "react";
import ReactDOM from "react-dom/client";

import { ToastContainer } from "react-toastify";

import App from "./App";

import "./styles/index.css";
import "react-toastify/dist/ReactToastify.css";

declare global {
  interface Array<T> {
    randomIdx(): number;
    random(): T;
  }
}

Array.prototype.randomIdx = function(this: Array<any>) {
  return Math.floor(Math.random() * this.length);
}

Array.prototype.random = function(this: Array<any>) {
  return this[this.randomIdx()];
}

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>
);