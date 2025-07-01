import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.tsx";
import MainProvider from "./context/MainProvider.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainProvider>
      <GoogleOAuthProvider clientId="1091903990138-o2dq78j1740onnnbn9mftad75o7kj032.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </MainProvider>
  </StrictMode>
);
