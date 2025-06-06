import { useEffect, useRef, useState, useContext, useMemo, type ReactNode} from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import { Link, useLocation, useParams , useSearchParams} from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface IMessage {
  msg: string;
  sentBy: string;
  sentAt?: string;
}

export default function Chat() {
  const { user, socket } = useContext(mainContext);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<IMessage[]>([]);
  const lastMsgRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const roomFromNotification = location.state?.room || null;
  const [matchUser, SetMatchUser] = useState<any>(null);

  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
  const reloaded = searchParams.get("reloaded");

  if (!reloaded) {
    searchParams.set("reloaded", "1");
    setSearchParams(searchParams); 
    window.location.reload();
  }
}, []);


  useEffect(() => {
    const getUser = async () => {
      try {
        const resp = await axiosPublic.get(`/getmatchuser/${id}`, {
          withCredentials: true,
        });
        SetMatchUser(resp.data.matchUser);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    getUser()
  }, [id]);

const room = useMemo(() => {
  if (!user || !matchUser) return "";
  return roomFromNotification ||
    [user.username.toLowerCase(), matchUser.username.toLowerCase()]
      .sort()
      .join("-");
}, [user, matchUser, roomFromNotification]);



  const getChat = async () => {
    if (!room) return;
    try {
      const resp = await axiosPublic.post("/getChatHistory", { room });
      setConversation(resp.data.chat || []);
      lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Chat fetch failed", err);
    }
  };

  useEffect(() => {

  const timer = setTimeout(() => {

  }, 1000);


  return () => clearTimeout(timer);
}, [room]);



  useEffect(() => {
    if (!user || !matchUser || !socket) return;

    const roomId = [user.username.toLowerCase(), matchUser.username.toLowerCase()]
      .sort()
      .join("-");

    const newRoom = roomFromNotification || roomId;

    socket.emit("join_room", newRoom);
    getChat();

    const handleReceiveMessage = (data: any) => {
      if (data.room === newRoom) {
        setConversation((prev) => [
          ...prev,
          {
            msg: data.message,
            sentBy: data.username,
            sentAt: data.sentAt,
          },
        ]);
        lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.emit("leave_room", newRoom);
    };
  }, [user, matchUser, socket]);

  useEffect(() => {
    if (conversation.length > 0) {
      lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !room || !socket) return;

    const sentAt = new Date().toISOString();
    const messageId = crypto.randomUUID();

    const newMsg = {
      message: message.trim(),
      sentBy: user?.username,
      sentAt,
    };

    setConversation((prev) => [...prev, { msg: newMsg.message, sentBy: user?.username || "", sentAt }]);
    setMessage("");

    setTimeout(() => {
      lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    socket.emit("send_message", {
      ...newMsg,
      room,
      username: user?.username,
      messageId,
    });
  };

 const formatTime = (timestamp?: string): ReactNode | string => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const isSameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: isSameYear ? undefined : "numeric",
  });
};


  if (!user && !matchUser && !conversation) {
    return <p>LOADING....</p>;
  }

  return (
<div className="flex flex-col h-[90vh] max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

  <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Link to={"/profil"}>
      <img
        src={matchUser?.userImage || "/default-avatar.png"}
        alt={matchUser?.username || "Chat"}
        className="w-10 h-10 rounded-full object-cover border"
      />
      </Link>
      <div>
        <p className="text-base font-semibold text-gray-800">{matchUser?.username}</p>
        <p className="text-xs text-green-500">Online</p>
      </div>
    </div>
    <Link to="/matche">
      <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
    </Link>
  </div>


  <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-5">
    <div className="flex flex-col gap-4">
      {conversation.map((msg, idx) => {
        const isCurrentUser = msg.sentBy === user?.username;
        const profileImage = isCurrentUser
          ? user.userImage || "/default-avatar.png"
          : matchUser?.userImage || "/default-avatar.png";

        return (
          <div
            key={`${msg.sentAt}-${idx}`}
            className={`flex items-end gap-2 ${
              isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isCurrentUser && (
              <img src={profileImage} alt={msg.sentBy} className="w-7 h-7 rounded-full" />
            )}
            <div
              className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                isCurrentUser
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-line">{msg.msg}</p>
              <p className="text-[10px] text-right mt-1 opacity-70">
                {formatTime(msg.sentAt)}
              </p>
            </div>
            {isCurrentUser && (
              <img src={profileImage} alt={msg.sentBy} className="w-7 h-7 rounded-full" />
            )}
          </div>
        );
      })}
      <div ref={lastMsgRef} />
    </div>
  </div>


  <form
    onSubmit={sendMessage}
    className="sticky bottom-0 z-20 bg-white border-t px-4 py-3 flex items-center gap-2"
  >
    <input
      type="text"
      placeholder="Type a message..."
      className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
    />
    <button
      type="submit"
      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M3.4 1.6a.75.75 0 0 0-.9.93l2.43 7.91H13.5a.75.75 0 0 1 0 1.5H4.93l-2.43 7.91a.75.75 0 0 0 .9.93 60.52 60.52 0 0 0 18.44-8.98.75.75 0 0 0 0-1.22A60.52 60.52 0 0 0 3.4 1.6z" />
      </svg>
    </button>
  </form>
</div>

  );
}