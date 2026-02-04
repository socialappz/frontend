import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.tsx";
import MainProvider from "./context/MainProvider.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { initDynamicCursor } from "./utils/cursorHandler.ts";

initDynamicCursor();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainProvider>
      <GoogleOAuthProvider
        clientId={
          import.meta.env.VITE_GOOGLE_CLIENT_ID as string}
      >
        <App />
      </GoogleOAuthProvider>
    </MainProvider>
  </StrictMode>
);
