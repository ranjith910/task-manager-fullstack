import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { store } from "./redux/store";
import App from "./App";
import "@fontsource-variable/inter";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000, className: "text-sm" }} />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
