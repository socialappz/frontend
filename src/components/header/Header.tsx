import { useContext, useState, useEffect } from "react";
import {
  Bell,
  Menu,
  X,
  Home,
  MessageCircle,
  Heart,
  LogOut,
  Camera,
} from "lucide-react";
import moment from "moment";
// @ts-ignore
import "moment/locale/de";
import { mainContext } from "../../context/MainProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import LoadingSpinner from "../common/LoadingSpinner";
import MapModal from "../map/MapModal";

moment.locale("de");

const Header = () => {
  const {
    notifications,
    setNotifications,
    user,
    setUser,
    loading,
    mapOpen,
    setMapOpen,
    setMatchUsers,
    reloadUser,
  } = useContext(mainContext);
  const [popupOpen, setPopupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = useNavigate();

  const logOutFunc = async () => {
    try {
      await axiosPublic.post("/auth/logout");
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
      setUser(null);
      navigation("/");
    } catch (error) {
      console.error("Logout error:", error);
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax";
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
      await fetch(`${apiUrl}/auth/markNotificationsRead`, {
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

  const deleteAllNotifications = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:2000";
      await fetch(`${apiUrl}/auth/clearNotifications`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user?.username }),
      });
      setNotifications([]);
    } catch (err) {
      console.error("Fehler beim Löschen der Benachrichtigungen:", err);
    }
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/chats", label: "Chats", icon: MessageCircle },
    { to: "/posts", label: "Posts", icon: Camera },
    { to: "/matche", label: "Friends", icon: Heart },
    { to: "/myprofile", label: "Profile", icon: null },
  ];

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b font-['Inter',sans-serif]">
        <div className="px-4 py-3 max-w-[1200px] mx-auto">
          <LoadingSpinner size="small" text="Loading..." />
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-ful font-Inter">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Dinder Logo"
              className="h-8 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          {user === null ? (
            <>
              {/* Center Links (Logged Out Desktop) */}
              <div className="hidden md:flex gap-10 font-semibold! text-sm text-[#006557]">
                <Link
                  to="/"
                  className="text-[#00A991] hover:text-[#008774] transition"
                >
                  Home
                </Link>
                <Link to="/#works" className="hover:text-[#00A991] transition">
                  How Dinder Works
                </Link>
                <Link to="/signup" className="hover:text-[#00A991] transition">
                  Register Now
                </Link>
              </div>

              {/* Right Buttons (Logged Out Desktop) */}
              <div className="hidden md:flex gap-4 items-center">
                <Link
                  to="/signin"
                  className="border-2 border-[#006557] text-[#006557] px-16 py-2.5 rounded-[29px] font-bold hover:bg-[#006557] hover:text-white transition inline-block text-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#00A991] text-white px-16 py-2.5 rounded-[29px] font-bold hover:bg-[#008774] transition inline-block text-center"
                >
                  Sign up
                </Link>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#FCF8EA] transition-colors font-bold text-[#006557] hover:text-[#00A991]"
                >
                  {label === "Profile" ? (
                    <img
                      src={user?.userImage || "/default-avatar.png"}
                      alt="Profilbild"
                      className="w-7 h-7 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    Icon && <Icon className="w-5 h-5" />
                  )}
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Notification & Logout (Logged In Desktop) */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setMapOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors h-10 focus:outline-none"
                aria-label="Open Coordination Map"
              >
                <img
                  src="/worldwide.png"
                  alt="Koordination"
                  className="w-6 h-6"
                />
              </button>
              <button
                onClick={handleTogglePopup}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors h-10 focus:outline-none"
              >
                <div className="relative">
                  {notifications.filter((n) => !n.read).length > 0 ? (
                    <>
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                      <Bell className="w-5 h-5 text-[#35374B]" />
                    </>
                  ) : (
                    <Bell className="w-5 h-5 text-[#35374B]" />
                  )}
                </div>
              </button>
              <button
                onClick={logOutFunc}
                className="bg-red-500 text-white px-5 py-2.5 rounded-full font-bold transition-colors flex items-center gap-2 hover:bg-red-600 focus:outline-none"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#006557] focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Notification Popup (Desktop & Mobile) */}
        {popupOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm"
              onClick={() => setPopupOpen(false)}
            />
            {/* Popup */}
            <div
              className="absolute right-4 md:right-[calc(50vw-600px+24px)] top-20 w-80 bg-white shadow-xl border rounded-2xl z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* X-Button zum Löschen aller Benachrichtigungen */}
              <button
                className="absolute top-3 right-3 text-sm text-gray-500 hover:text-red-500 focus:outline-none font-bold transition"
                onClick={deleteAllNotifications}
                aria-label="notification deleted"
              >
                Clear All
              </button>
              <h3 className="font-bold text-[#35374B] text-lg mb-3">
                Notifications
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2 font-sans">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Empty</p>
                ) : (
                  notifications
                    .map((n, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-bold text-[#35374B]">
                              {n.from}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {n.message}
                            </div>
                            {n?.type === "like" ? (
                              <div className="flex gap-2 mt-2">
                                <button
                                  className="px-3 py-1.5 rounded-md bg-[#00A991] text-white text-sm font-bold hover:bg-[#008774] transition"
                                  onClick={async () => {
                                    try {
                                      await axiosPublic.post(
                                        "/api/like",
                                        { likedUsername: n.from },
                                        { withCredentials: true },
                                      );
                                      try {
                                        await (reloadUser && reloadUser());
                                      } catch {}
                                      try {
                                        const resp = await axiosPublic.get(
                                          "/auth/getMatchedUsers",
                                          { withCredentials: true },
                                        );
                                        setMatchUsers(
                                          Array.isArray(resp.data)
                                            ? resp.data
                                            : [],
                                        );
                                      } catch {}
                                      setNotifications((prev) =>
                                        prev.filter((x) => x !== n),
                                      );
                                    } catch (err) {
                                      console.error("Error liking back:", err);
                                    } finally {
                                      setPopupOpen(false);
                                    }
                                  }}
                                >
                                  Accept
                                </button>
                                <button
                                  className="px-3 py-1.5 rounded-md bg-gray-200 text-[#35374B] text-sm font-bold hover:bg-gray-300 transition"
                                  onClick={() => {
                                    setNotifications((prev) =>
                                      prev.filter((x) => x !== n),
                                    );
                                    navigation("/matche");
                                  }}
                                >
                                  Decline
                                </button>
                              </div>
                            ) : n?.type === "post_like" ||
                              n?.type === "post_comment" ? (
                              <Link
                                onClick={() => {
                                  setPopupOpen(false);
                                  setNotifications((prev) =>
                                    prev.map((notif) =>
                                      notif === n
                                        ? { ...notif, read: true }
                                        : notif,
                                    ),
                                  );
                                }}
                                className="inline-block mt-2 text-[#00A991] text-sm hover:underline font-bold"
                                to="/posts"
                              >
                                Go to Posts
                              </Link>
                            ) : (
                              <Link
                                onClick={() => setPopupOpen(false)}
                                className="inline-block mt-2 text-[#00A991] text-sm hover:underline font-bold"
                                to={`/chat/${n?.senderId}`}
                              >
                                Go to Chat
                              </Link>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 ml-2 whitespace-nowrap font-medium">
                            {moment(n.sentAt).fromNow()}
                          </div>
                        </div>
                      </div>
                    ))
                    .reverse()
                )}
              </div>
            </div>
          </>
        )}

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex justify-end">
            <div className="w-72 bg-white h-full shadow-lg p-6 flex flex-col gap-6 pt-20 relative">
              <button
                className="absolute top-6 right-6 text-[#006557]"
                onClick={() => setMenuOpen(false)}
              >
                <X className="w-7 h-7" />
              </button>

              <div className="flex flex-col gap-4">
                {user === null ? (
                  <>
                    <Link
                      to="/"
                      onClick={() => setMenuOpen(false)}
                      className="text-[#006557] font-bold text-lg"
                    >
                      Home
                    </Link>
                    <Link
                      to="/#works"
                      onClick={() => setMenuOpen(false)}
                      className="text-[#006557] font-bold text-lg"
                    >
                      How Dinder Works
                    </Link>
                    <hr className="border-gray-200 my-4" />
                    <Link
                      to="/signin"
                      onClick={() => setMenuOpen(false)}
                      className="border-2 border-[#006557] text-[#006557] px-6 py-3 rounded-full font-bold text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="bg-[#00A991] text-white px-6 py-3 rounded-full font-bold text-center"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  navLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FCF8EA] transition-colors font-bold text-[#006557]"
                      onClick={() => setMenuOpen(false)}
                    >
                      {label === "Profile" ? (
                        <img
                          src={user?.userImage || "/default-avatar.png"}
                          alt="Profilbild"
                          className="w-7 h-7 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        Icon && <Icon className="w-5 h-5" />
                      )}
                      <span>{label}</span>
                    </Link>
                  ))
                )}
              </div>

              {user && (
                <div className="flex flex-col gap-3 mt-auto mb-10">
                  <button
                    onClick={() => {
                      setMapOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-3 p-3 rounded-xl transition-colors w-full font-bold text-[#006557] bg-[#FCF8EA]"
                  >
                    <img
                      src="/worldwide.png"
                      alt="coordination"
                      className="w-5 h-5"
                    />
                    <span>Map</span>
                  </button>
                  <button
                    onClick={() => {
                      handleTogglePopup();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl text-white bg-[#00A991] transition-colors w-full font-bold"
                  >
                    <div className="relative">
                      {notifications.filter((n) => !n.read).length > 0 ? (
                        <>
                          <Bell className="w-5 h-5 text-white" />
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {notifications.filter((n) => !n.read).length}
                          </span>
                        </>
                      ) : (
                        <Bell className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span>Notifications</span>
                  </button>
                  <button
                    onClick={() => {
                      logOutFunc();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl text-white bg-red-500 transition-colors w-full font-bold"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Koordinations-Modal */}
        <MapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} />
      </div>
    </header>
  );
};

export default Header;
