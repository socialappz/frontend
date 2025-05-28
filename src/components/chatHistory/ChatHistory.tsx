import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import { mainContext } from "../../context/MainProvider";

interface IUser {
  username: string;
  userImage: string;
}

interface IMessage {
  msg: string;
  sentBy: string;
  sentAt?: string;
}

interface IChat {
  roomId: string;
  chat: IMessage[];
  sentAt: string;
}

export default function ChatHistory() {
  const {
    user,
    setSelectedUser,
    notifications,
  } = useContext(mainContext);

  const [chats, setChats] = useState<IChat[]>([]);
  const [matchUsers, setMatchUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const getChats = async () => {
    try {
      const resp = await axiosPublic.get("/getChats", {
        withCredentials: true,
      });
      setChats(resp.data);
    } catch (err) {
      console.error("Error loading chats", err);
    }
  };

  const getMatchUsers = async () => {
    try {
      const resp = await axiosPublic.get("/getMatchedUsers", {
        withCredentials: true,
      });
      setMatchUsers(resp.data);
    } catch (err) {
      console.error("Error loading matched users", err);
    }
  };

  const findUser = (room: string): IUser | undefined | any => {
    const roomUsers = room.split("-");
    const otherUsername = roomUsers.find(
      (u) => u !== user?.username.toLowerCase()
    );
    return matchUsers.find(
      (u) => u.username.toLowerCase() === otherUsername
    );
  };

  const displayTime = (time: string): string => {
    const now = new Date();
    const sentAt = new Date(time);
    const diff = now.getTime() - sentAt.getTime();

    if (diff > 86400000) {
      const days = Math.floor(diff / 86400000);
      return days === 1 ? "yesterday" : `${days} days ago`;
    }
    if (diff > 3600000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diff > 60000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return "just now";
  };

  const sortedChats = chats.sort((a, b) => {
    return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([getChats(), getMatchUsers()]).finally(() =>
      setTimeout(() => setLoading(false), 500)
    );
  }, []);

  useEffect(() => {
    getChats();
  }, [notifications]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-blue-600 text-lg animate-pulse">Loading chats...</div>
      </div>
    );
  }

  if (!chats.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          You have no chats yet!
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Chats</h1>
      <div className="space-y-3">
        {sortedChats.map((chat) => {
          const friend = findUser(chat.roomId);
          const lastMsg = chat.chat[chat.chat.length - 1];
          if (!friend) return null;

          return (
            <div
              key={friend.username}
              className={`flex items-center p-4 rounded-lg shadow hover:bg-gray-50 cursor-pointer ${
                notifications?.includes(friend?.username) ? "bg-blue-50" : "bg-white"
              }`}
              onClick={() => {
                setSelectedUser(friend);
                navigate(`/chat/${friend._id}`);
              }}
            >
              <img
                src={friend.userImage}
                alt={friend.username}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div className="flex-1">
                <p className="font-semibold">{friend.username}</p>
                <p className="text-gray-500 text-sm truncate">
                  {lastMsg?.msg.split(" ").slice(0, 10).join(" ")}...
                </p>
              </div>
              <span className="text-xs text-gray-400 ml-2">
                {displayTime(chat.sentAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
