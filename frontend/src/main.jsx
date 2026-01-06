import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { InfoProvider } from "./components/info/InfoProvider";
import { InfoPopup } from "./components/info/InfoPopup";

createRoot(document.getElementById("root")).render(<App />);
