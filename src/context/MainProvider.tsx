import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { IUser } from "../interfaces/user/IUser";
import { axiosPublic } from "../utils/axiosConfig";
import { io, Socket } from "socket.io-client";

export interface INotification {
  read: any;
  from: string;
  message: string;
  sentAt: Date;
  senderId: string,
  friend: string,
}

interface IMainContext {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  selectedUser: any;
  matchUsers: [];
  setMatchUsers: React.Dispatch<React.SetStateAction<[]>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<any>>;
  notifications: INotification[];
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
  socket: Socket | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<any>>;
}

export const mainContext = createContext<IMainContext>({} as IMainContext);

export default function MainProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<IUser | null>(null); // <-- initial null!
  const [matchUsers, setMatchUsers] = useState<[]>([]);
  const [selectedUser, setSelectedUser] = useState({});

  useEffect(() => {
    let isMounted = true;
    let activeSocket: Socket | null = null;

    const hasAuthCookie = () => {
      return document.cookie.split(';').some(cookie =>
        cookie.trim().startsWith('jwt=') ||
        cookie.trim().startsWith('token')
      );
    };

    const fetchUserAndSetupSocket = async () => {
      try {
        if (!hasAuthCookie()) {
          setUser(null);
          setLoading(false);
          return;
        }
        const resp = await axiosPublic.get("/currentUser", {
          withCredentials: true,
        });

        if (!isMounted) return;

        const userData = resp.data;
        activeSocket = io("http://localhost:2000", {
          withCredentials: true,
          reconnectionAttempts: 3,
          transports: ["websocket"],
        });

        activeSocket.emit("join_room", userData.username.toLowerCase());

        activeSocket.on("receive_message", (data) => {
          if (!isMounted) return;
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

        setSocket(activeSocket);
        setUser(userData);
        setNotifications(userData.notifications || []);
      } catch (err: any) {
        setUser(null); // <-- User immer auf null setzen, wenn Fehler
        if (!err.response || err.response.status !== 403) {
          console.error("Error initializing user:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserAndSetupSocket();

    return () => {
      isMounted = false;
      if (activeSocket) {
        activeSocket.off("receive_message");
        activeSocket.disconnect();
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
        setLoading
      }}
    >
      {children}
    </mainContext.Provider>
  );
}