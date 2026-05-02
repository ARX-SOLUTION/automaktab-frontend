import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });
createRoot(document.getElementById("root")!).render(
  <div className="animate-fade-in">Error</div>,
);
