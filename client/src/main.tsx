import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Leaflet CSS must be imported
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(<App />);
