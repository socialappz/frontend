import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { IUser } from "../interfaces/user/IUser";
import type { IMatchUser } from "../interfaces/match/IMatchUser";
import { axiosPublic } from "../utils/axiosConfig";
import { io, Socket } from "socket.io-client";

export interface INotification {
  read: any;
  from: string;
  message: string;
  sentAt: Date;
  senderId: string;
  friend: string;
}

export interface IMainContext {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  selectedUser: any;
  matchUsers: IMatchUser[];
  setMatchUsers: React.Dispatch<React.SetStateAction<IMatchUser[]>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<any>>;
  notifications: INotification[];
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
  socket: Socket | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<any>>;
  reloadUser?: () => Promise<void>;
}

export const mainContext = createContext<IMainContext>({
  user: null,
  setUser: () => {},
  selectedUser: {},
  matchUsers: [],
  setMatchUsers: () => {},
  setSelectedUser: () => {},
  notifications: [],
  setNotifications: () => {},
  socket: null,
  loading: false,
  setLoading: () => {},
  reloadUser: async () => {},
});

export default function MainProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<IUser | null>(null);
  const [matchUsers, setMatchUsers] = useState<IMatchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const reloadUser = async () => {
    try {
      const hasCookie = document.cookie.includes("token=");
      if (!hasCookie) {
        setUser(null);
        setLoading(false);
        return;
      }
      const resp = await axiosPublic.get("/currentUser", {
        withCredentials: true,
      });
      const userData = resp.data;

      if (
        socketRef.current instanceof Object &&
        typeof socketRef.current.off === "function" &&
        typeof socketRef.current.disconnect === "function"
      ) {
        socketRef.current.off("receive_message");
        socketRef.current.disconnect();
      }
      const socketURL = import.meta.env.VITE_API_URL || "http://localhost:2000";
      const newSocket = io(socketURL, {
        withCredentials: true,
        reconnectionAttempts: 3,
        transports: ["websocket"],
      });
      newSocket.emit("join_room", userData?.username?.toLowerCase());
      newSocket.on("receive_message", (data) => {
        setNotifications((prev) => [
          ...prev,
          {
            from: data.username,
            message: data.message,
            room: data.room,
            sentAt: new Date(data.sentAt),
            read: false,
            senderId: data.senderId,
            friend: "",
          },
        ]);
      });
      socketRef.current = newSocket;
      setSocket(newSocket);
      setUser(userData);
      setNotifications(userData.notifications || []);
    } catch (err: any) {
      console.error("Error in reloadUser:", err);
      setUser(null);
      if (!err.response || err.response.status !== 403) {
        console.error("Error initializing user:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadUser();
    return () => {
      if (
        socketRef.current instanceof Object &&
        typeof socketRef.current.off === "function" &&
        typeof socketRef.current.disconnect === "function"
      ) {
        socketRef.current.off("receive_message");
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <mainContext.Provider
      value={{
        user,
        setUser,
        selectedUser,
        setSelectedUser,
        matchUsers,
        setMatchUsers,
        notifications,
        setNotifications,
        socket,
        loading,
        setLoading,
        reloadUser,
      }}
    >
      {children}
    </mainContext.Provider>
  );
}
