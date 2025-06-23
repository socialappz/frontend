import { useContext, useState, useEffect } from "react";
import { Bell, Menu, X, Home, MessageCircle, Heart, User, LogOut } from "lucide-react";
import moment from "moment";
// @ts-ignore
import "moment/locale/de";
import { mainContext } from "../../context/MainProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import LoadingSpinner from "../common/LoadingSpinner";
import icon from "../../../public/dog-icon.png"

moment.locale("de");

const Header = () => {
  const { notifications, setNotifications, user, setUser, loading } = useContext(mainContext);
  const [popupOpen, setPopupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = useNavigate();

  const logOutFunc = async () => {
    try {
      await axiosPublic.post("/logout");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
      console.log('Logout successful, cookies cleared');
      setUser(null);
      navigation("/");
    } catch (error) {
      console.error('Logout error:', error);
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
      setUser(null);
      navigation("/");
    }
  };

  const handleTogglePopup = async () => {
    setPopupOpen(!popupOpen);
    await clearNotifications();
  };

  const clearNotifications = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:2000";
      await fetch(`${apiUrl}/markNotificationsRead`, {
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
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Link 
        to="/signup" 
        className="w-full sm:w-auto bg-black text-white! font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center" 
        onClick={onClick}
      >
        Sign Up
      </Link>
      <Link 
        to="/signin" 
        className="w-full sm:w-auto bg-black text-white! font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center" 
        onClick={onClick}
      >
        Sign In
      </Link>
    </div>
  );

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/chats', label: 'Chats', icon: MessageCircle },
    { to: '/matche', label: 'Matches', icon: Heart },
    { to: '/myprofile', label: 'Profile', icon: User },
  ];

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <LoadingSpinner size="small" text="Loading..." />
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-black!">
            <img src={icon} alt="Logo" className="w-10" />
          </Link>

          {/* Desktop Navigation */}
          {user === null ? (
            <div className="hidden md:flex items-center gap-4">
              <NavLinks />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium text-black!"
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Notification & Logout */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleTogglePopup}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-white!" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              <button
                onClick={logOutFunc}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6 text-white!" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Notification Popup (Desktop & Mobile) */}
        {popupOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setPopupOpen(false)}
            />
            {/* Popup */}
            <div
              className="absolute right-4 top-20 w-80 bg-white shadow-xl border rounded-2xl z-50 p-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-black! mb-3">Notification</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Empty</p>
                ) : (
                  notifications.map((n, idx) => (
                    <Link
                      key={idx}
                      onClick={() => setPopupOpen(false)}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      to={`/chat/${n?.senderId}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{n.from}</div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {n.message}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 ml-2">
                          {moment(n.sentAt).fromNow()}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end">
            <div className="w-72 bg-white h-full shadow-lg p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {user === null ? (
                  <NavLinks onClick={() => setMenuOpen(false)} />
                ) : (
                  navLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors font-medium text-black!"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  ))
                )}
              </div>
              {user && (
                <>
                  <button
                    onClick={() => { handleTogglePopup(); setMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors w-full font-medium text-gray-800"
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5 text-white" />
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white! text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {notifications.filter((n) => !n.read).length}
                        </span>
                      )}
                    </div>
                    <span className="text-white">Notification</span>
                  </button>
                  <button
                    onClick={() => { logOutFunc(); setMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors w-full font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;