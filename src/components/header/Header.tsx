import { useContext, useState, useEffect } from "react";
import { Bell, Menu, X } from "lucide-react";
import moment from "moment";
// @ts-ignore
import "moment/locale/de";
import { mainContext } from "../../context/MainProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";

moment.locale("de");

const Header = () => {
  const { notifications, setNotifications, user, setUser } = useContext(mainContext);
  const [popupOpen, setPopupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = useNavigate()


  const logOutFunc = async () => {
    try {
        const resp = await axiosPublic.post("/logout")
        setUser(null)
        navigation("/")
        console.log(resp);
    } catch (error) {
      
    }
  }

  const handleTogglePopup = async () => {
    setPopupOpen(!popupOpen);
    await clearNotifications();
  };

  const clearNotifications = async () => {
    try {
      await fetch("http://localhost:2000/markNotificationsRead", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user?.username }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };


  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link to="/signup" className="inline-block bg-black !text-white font-bold py-3 px-8 rounded-full shadow-lg hover:brightness-110 transition duration-300" onClick={onClick}>Sign Up</Link>
      <Link to="/signin" className="inline-block bg-black !text-white font-bold py-3 px-8 rounded-full shadow-lg hover:brightness-110 transition duration-300" onClick={onClick}>Sign In</Link>
      <Link to="/about" className="inline-block bg-black !text-white font-bold py-3 px-8 rounded-full shadow-lg hover:brightness-110 transition duration-300" onClick={onClick}>About Us</Link>
      <Link to="/contact" className="inline-block bg-black !text-white font-bold py-3 px-8 rounded-full shadow-lg hover:brightness-110 transition duration-300" onClick={onClick}>Contact Us</Link>
    </>
  );

  return (
    <header className="relative p-4 flex justify-between items-center bg-white shadow-md z-50">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden block text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="ml-auto">
        {user === null ? (
          <div className="hidden lg:flex items-center gap-6">
            <NavLinks />
          </div>
        ) : (
          <div className="flex items-center gap-4 relative">
            <div className="text-right hidden lg:block">
              <p className="text-sm text-gray-700">Willkommen zurück</p>
              <p className="font-semibold text-gray-800">{user.username}</p>
            </div>

            <Link to="/dashboard">
              <img
                src={user.userImage}
                alt="User"
                className="w-10 h-10 rounded-full object-cover border"
              />
            </Link>

            <div className="relative cursor-pointer" onClick={handleTogglePopup}>
              <Bell className="text-gray-800 w-6 h-6" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>

            <button onClick={logOutFunc} className="bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600 transition">
              Logout
            </button>

            {popupOpen && (
              <div className="absolute top-16 right-0 w-72 bg-white shadow-lg border rounded-xl z-50 p-4">
                <ul className="max-h-64 overflow-y-auto text-sm space-y-3">
                  {notifications.length === 0 ? (
                    <li className="text-gray-500 text-center">
                      Keine neuen Nachrichten
                    </li>
                  ) : (
                    notifications.map((n, idx) => (
                      <Link
                        key={idx}
                        onClick={async () => {
                          await clearNotifications();
                          setPopupOpen(false);
                        }}
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded-md transition block"
                        to={`/chat/${n?.senderId}`}
                      >
                        <div className="font-medium text-gray-800">{n.from}</div>
                        <div className="text-xs text-gray-500">
                          {moment(n.sentAt).fromNow()}
                        </div>
                        <div className="text-sm text-gray-600 italic">
                          {n.message}
                        </div>
                      </Link>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-4 right-4 bg-white border rounded-lg shadow-md lg:hidden p-4 z-40 space-y-3">
          {user === null ? (
            <NavLinks onClick={() => setMenuOpen(false)} />
          ) : (
            <>
              <Link to="/" className="block text-gray-700! hover:underline" onClick={() => setMenuOpen(false)}>
                Startseite
              </Link>

              <Link to="/chats" className="block text-gray-700! hover:underline" onClick={() => setMenuOpen(false)}>
                Chats
              </Link>

              <Link to="/matche" className="block text-gray-700! hover:underline" onClick={() => setMenuOpen(false)}>
                Matchs
              </Link>

            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
