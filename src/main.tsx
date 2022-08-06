import React from "react";
import ReactDOM from "react-dom/client";

import { ToastContainer } from "react-toastify";

import App from "./App";

import "./styles/index.css";
import "react-toastify/dist/ReactToastify.css";

declare global {
  interface Array<T> {
    randomIdx(): number;
  }
}

Array.prototype.randomIdx = function(this: Array<any>) {
  return Math.floor(Math.random() * this.length);
}

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>
);