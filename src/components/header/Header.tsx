import { useContext, useState, useEffect } from "react";
import { Bell, Menu, X, Home, MessageCircle, Heart, User, LogOut } from "lucide-react";
import moment from "moment";
// @ts-ignore
import "moment/locale/de";
import { mainContext } from "../../context/MainProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import LoadingSpinner from "../common/LoadingSpinner";

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
        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center" 
        onClick={onClick}
      >
        Sign Up
      </Link>
      <Link 
        to="/signin" 
        className="w-full sm:w-auto bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center" 
        onClick={onClick}
      >
        Sign In
      </Link>
    </div>
  );

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
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Dogder
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user === null ? (
            <div className="hidden md:flex items-center gap-4">
              <NavLinks />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Willkommen zurück</p>
                <p className="font-semibold text-gray-800">{user.username}</p>
              </div>

              <Link to="/myprofile" className="relative">
                <img
                  src={user.userImage}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                />
              </Link>

              <div className="relative">
                <button 
                  onClick={handleTogglePopup}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {popupOpen && (
                  <div className="absolute top-12 right-0 w-80 bg-white shadow-xl border rounded-2xl z-50 p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Benachrichtigungen</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Keine neuen Nachrichten</p>
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
                )}
              </div>

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
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 bg-white border rounded-2xl shadow-lg p-4 space-y-4">
            {user === null ? (
              <NavLinks onClick={() => setMenuOpen(false)} />
            ) : (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <img
                    src={user.userImage}
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-500">Willkommen zurück</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link 
                    to="/" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Home className="w-5 h-5 text-gray-600" />
                    <span>Startseite</span>
                  </Link>
                  <Link 
                    to="/chats" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span>Chats</span>
                  </Link>
                  <Link 
                    to="/matche" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                    <span>Matches</span>
                  </Link>
                  <Link 
                    to="/myprofile" 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span>Profil</span>
                  </Link>
                </div>

                {/* Notifications */}
                <div className="border-t pt-3">
                  <button 
                    onClick={handleTogglePopup}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors w-full"
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5 text-gray-600" />
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {notifications.filter((n) => !n.read).length}
                        </span>
                      )}
                    </div>
                    <span>Benachrichtigungen</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t pt-3">
                  <button 
                    onClick={logOutFunc}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;