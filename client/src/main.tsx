import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Leaflet CSS must be imported
import "leaflet/dist/leaflet.css";

// Fix z-index hierarchy for map and UI elements
const fixZIndexHierarchy = () => {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* Global z-index fixes */
    .leaflet-map-pane {
      z-index: 1 !important;
    }
    .leaflet-tile-pane {
      z-index: 2 !important;
    }
    .leaflet-overlay-pane {
      z-index: 350 !important;
    }
    .leaflet-shadow-pane {
      z-index: 450 !important;
    }
    .leaflet-marker-pane {
      z-index: 500 !important;
    }
    .leaflet-tooltip-pane {
      z-index: 600 !important;
    }
    .leaflet-popup-pane {
      z-index: 700 !important;
    }
    .leaflet-control {
      z-index: 800 !important;
    }
    
    /* Make sure sidebar and panels are above map */
    .sidebar {
      z-index: 900 !important;
      position: relative;
    }
    
    /* Make info drawer the highest z-index */
    .info-drawer-backdrop {
      z-index: 9999 !important;
    }
    .info-drawer {
      z-index: 10000 !important;
    }
  `;
  document.head.appendChild(styleEl);
};

// Call the fix function
fixZIndexHierarchy();

createRoot(document.getElementById("root")!).render(<App />);
