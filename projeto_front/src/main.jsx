import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "react-loading-skeleton/dist/skeleton.css";
import App from "./App.jsx";
import { manipulateLocalStorage } from "./utils/encrypt-storage";

const skeletonStyle = document.createElement("style");
skeletonStyle.textContent = `
  .react-loading-skeleton {
    background: linear-gradient(90deg, rgba(10, 10, 10, 0.88) 25%, rgba(35, 35, 35, 0.95) 50%, rgba(10, 10, 10, 0.88) 75%) !important;
    background-size: 200% 100% !important;
  }
`;
document.head.appendChild(skeletonStyle);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
    {/* <RegisterTest /> */}
  </StrictMode>,
);

manipulateLocalStorage();
