import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import { mainContext, type INotification } from "../../context/MainProvider";
import type { IChat } from "../../interfaces/chat/IChat";
import type { IUser } from "../../interfaces/chat/IUser";
import type { IMatchUser } from "../../interfaces/match/IMatchUser";
import LoadingSpinner from "../common/LoadingSpinner";
import NoDataMessage from "../common/NoDataMessage";

interface IChatHistoryProps {
  user: IUser,
  setSelectedUser: React.Dispatch<React.SetStateAction<any>>;
  notifications: INotification | unknown,
  matchUsers: IMatchUser[];
  setMatchUsers: React.Dispatch<React.SetStateAction<IMatchUser[]>>;
}

export default function ChatHistory() {
  const {
    user,
    setSelectedUser,
    notifications,
    matchUsers,
    setMatchUsers
  } = useContext(mainContext) as IChatHistoryProps;
  const [chats, setChats] = useState<IChat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getChats = useCallback(async () => {
    try {
      const resp = await axiosPublic.get("/getChats", {
        withCredentials: true,
      });
      setChats(resp.data);
    } catch (err) {
      console.error("Error loading chats:", err);
      setError("Fehler beim Laden der Chats");
      setChats([]);
    }
  }, []);

  const getMatchUsers = useCallback(async () => {
    try {
      const resp = await axiosPublic.get("/getMatchedUsers", {
        withCredentials: true,
      });
      setMatchUsers(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error("Error loading matched users:", err);
      setError("Fehler beim Laden der Benutzer");
      setMatchUsers([]);
    }
  }, []);

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
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([getChats(), getMatchUsers()]);
      } catch (err) {
        setError("Fehler beim Laden der Daten");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getChats, getMatchUsers]);

  useEffect(() => {
    getChats();
  }, [notifications]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
            }}
            className="mt-2 text-red-700 hover:text-red-900 underline"
          >
            Try Again!
          </button>
        </div>
      </div>
    );
  }

  if (!chats.length) {
    return (
      <NoDataMessage 
        message="You have any Message"
        linkText="Find some new Friends"
        linkTo="/matche"
      />
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
              className={`flex items-center p-4 rounded-lg shadow hover:bg-gray-50! cursor-pointer ${
                Array.isArray(notifications) && notifications.includes(friend?.username) ? "bg-blue-50" : "bg-white"
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
        })}      </div>
    </div>
  );
}
