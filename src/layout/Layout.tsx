import Header from "../components/header/Header";
import CookieConsent from "../components/common/CookieConsent";
import { Outlet, useLocation, useMatch } from "react-router-dom";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const notLayout = location.pathname === "/dashboard";
  const match = useMatch("/chat/:id");

  useEffect(() => {
    // Prüfen, ob ein Hash in der URL existiert (z.B. "#works")
    if (location.hash) {
      // Ein kurzes Timeout stellt sicher, dass die Seite (und die Section)
      // bereits komplett geladen wurde, bevor gescrollt wird.
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Wenn kein Hash existiert, ganz normal nach oben scrollen
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]); // location.hash als Dependency hinzugefügt

  return (
    <>
      {notLayout || match ? "" : <Header />}
      <Outlet />
      <CookieConsent />
    </>
  );
}
