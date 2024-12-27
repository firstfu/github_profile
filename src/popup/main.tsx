import React from "react";
import ReactDOM from "react-dom/client";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import App from "./App";

// 添加全局樣式
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
