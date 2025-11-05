import { useEffect, useRef, useState, useContext, useMemo } from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import type { IMatchUser } from "../../interfaces/match/IMatchUser";
import { formatTime } from "../../functions/formatTime";
import { groupMessagesByDate } from "../../functions/groupMessagesByDate";
interface IMessage {
  msg: string;
  sentBy: string;
  sentAt?: string;
}

export default function Chat() {
  const { user, socket, setNotifications } = useContext(mainContext);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const lastMsgRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const roomFromNotification = location.state?.room || null;
  const [matchUser, SetMatchUser] = useState<IMatchUser | null>(null);

  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const room = useMemo(() => {
    if (!user || !matchUser) return "";
    return (
      roomFromNotification ||
      [user.username.toLowerCase(), matchUser.username.toLowerCase()]
        .sort()
        .join("-")
    );
  }, [user, matchUser, roomFromNotification]);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    return () => clearTimeout(timer);
  }, [room]);

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
        setLoading(true);
        const resp = await axiosPublic.get(`/getmatchuser/${id}`, {
          withCredentials: true,
        });
        SetMatchUser(resp.data.matchUser);
        await clearNotifications();
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [id]);

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
    if (!user || !matchUser || !socket) return;
    const roomId = [
      user.username.toLowerCase(),
      matchUser.username.toLowerCase(),
    ]
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

    setConversation((prev) => [
      ...prev,
      { msg: newMsg.message, sentBy: user?.username || "", sentAt },
    ]);
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

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center"></div>
      </div>
    );
  }

  if (!user || !matchUser) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Chat not found </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border border-gray-300 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            to="/chats"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Link
            to={`/matche/${matchUser._id}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <img
              src={matchUser.userImage || "/default-avatar.png"}
              alt={matchUser.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {matchUser.username}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 border border-gray-300">
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-black!" />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              write your first message with {matchUser.username}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupMessagesByDate(conversation)).map(
              ([date, messages]) => (
                <div key={date}>
                  <div className="flex justify-center my-4">
                    <span className="bg-white text-gray-500 px-4 py-2 rounded-full text-sm font-medium shadow-sm border">
                      {date}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {messages.map((msg, idx) => {
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
                            <img
                              src={profileImage}
                              alt={msg.sentBy}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div
                            className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                              isCurrentUser
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.msg}
                            </p>
                            <p
                              className={`text-xs mt-2 ${
                                isCurrentUser
                                  ? "text-blue-100"
                                  : "text-gray-400"
                              }`}
                            >
                              {formatTime(msg.sentAt)}
                            </p>
                          </div>
                          {isCurrentUser && (
                            <img
                              src={profileImage}
                              alt={msg.sentBy}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
            <div ref={lastMsgRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border border-gray-300 px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="message..."
            className="flex-1 px-4 py-3 rounded-full bg-gray-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-colors"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-3 bg-black! text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
