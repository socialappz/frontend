import Header from "../components/header/Header";
import CookieConsent from "../components/common/CookieConsent";
import { Outlet, useLocation, useMatch } from "react-router-dom";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();

  const notLayout = location.pathname === "/dashboard";
  // Prüft, ob der aktuelle Pfad in diesem Array existiert
  const notHeader = ["/signin", "/signup"].includes(location.pathname);
  const match = useMatch("/chat/:id");

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  // Wenn notLayout, match ODER notHeader true ist, Header ausblenden
  const hideHeader = notLayout || match || notHeader;

  return (
    <>
      {/* null ist in React die saubere Methode, um nichts zu rendern (statt "") */}
      {hideHeader ? null : <Header />}
      <Outlet />
      <CookieConsent />
    </>
  );
}
