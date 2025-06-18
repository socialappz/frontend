import React, {
  createContext,
  useEffect,
  useState,
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
  senderId: string,
  friend: string,
}

interface IMainContext {
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
}

export const mainContext = createContext<IMainContext>({} as IMainContext);

export default function MainProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [matchUsers, setMatchUsers] = useState<IMatchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState({});

  useEffect(() => {
    let isMounted = true;
    let activeSocket: Socket | null = null;

    const fetchUserAndSetupSocket = async () => {
      try {
        const hasCookie = document.cookie.includes('token=');
        console.log('Has auth cookie:', hasCookie);
        console.log('All cookies:', document.cookie);
        
        if (!hasCookie) {
          console.log('No auth cookie found, setting user to null');
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('Fetching current user...');
        const resp = await axiosPublic.get("/currentUser", {
          withCredentials: true
        });

        if (!isMounted) return;

        const userData = resp.data;
        console.log('User data received:', userData);
        
        // Socket.IO-Verbindung aktivieren (Render unterstützt WebSockets)
        const socketURL = import.meta.env.VITE_API_URL || "http://localhost:2000";
        console.log('Connecting to socket:', socketURL);
        activeSocket = io(socketURL, {
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
        console.log('User set successfully');
      } catch (err: any) {
        console.error('Error in fetchUserAndSetupSocket:', err);
        setUser(null);
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