import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import { ArrowLeft, Heart } from "lucide-react";
import { useContext } from "react";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";
import Carousel from "react-bootstrap/Carousel";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

import { formatDogAge } from "../../functions/formatDogAge";
import { calculateAge } from "../../functions/calculateAge";

interface IProfileProps {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

export default function Profile() {
  const { id } = useParams();
  const [matchUser, setMatchUser] = useState<any>(null);
  const [likeSent, setLikeSent] = useState(false);
  const [isMatch, setIsMatch] = useState<undefined | boolean>(undefined);
  const [checkingMatch, setCheckingMatch] = useState(false);
  const [notification, setNotification] = useState("");
  const { user, setUser } = useContext(mainContext) as IProfileProps;
  const [canChat, setCanChat] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const prevIsMatch = useRef<boolean | undefined>(undefined);
  const [, setJustLiked] = useState(false);

  const normalize = (name: string) => name.toLowerCase().replace(/\s+/g, "");

  useEffect(() => {
    const getUser = async () => {
      try {
        const resp = await axiosPublic.get(`/getmatchuser/${id}`, {
          withCredentials: true,
        });
        setMatchUser(resp.data.matchUser);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    getUser();
  }, [id]);

  useEffect(() => {
    if (!user || !matchUser) return;
    const targetUsername = normalize(matchUser.username);
    const alreadyLiked = user.likes?.map(normalize).includes(targetUsername);
    setLikeSent(alreadyLiked);
  }, [user, matchUser]);

  useEffect(() => {
    if (!user || !matchUser) return;
    const myUsername = normalize(user.username);
    const targetUsername = normalize(matchUser.username);
    setCheckingMatch(false);
    axiosPublic
      .get(`/isMatch/${myUsername}/${targetUsername}`, {
        withCredentials: true,
      })
      .then((res) => setIsMatch(res.data.isMatch))
      .finally(() => setCheckingMatch(true));
  }, [user, matchUser, likeSent]);

  useEffect(() => {
    if (!user || !matchUser) return;
    const myUsername = normalize(user.username);
    const targetUsername = normalize(matchUser.username);
    axiosPublic
      .get(`/canChat/${myUsername}/${targetUsername}`, {
        withCredentials: true,
      })
      .then((res) => {
        setCanChat(res.data.canChat);
      });
  }, [user, matchUser, likeSent, isMatch]);

  const refreshUser = async () => {
    try {
      const resp = await axiosPublic.get("/currentUser", {
        withCredentials: true,
      });
      setUser(resp.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const targetUsername = normalize(matchUser.username);
      await axiosPublic.post(
        "/like",
        { likedUsername: targetUsername },
        { withCredentials: true }
      );
      setLikeSent(true);
      setNotification("Like sent. Waiting for a match!");
      setJustLiked(true);
      await refreshUser();
    } catch (err) {
      setNotification("Error liking or already liked.");
    }
  };

  useEffect(() => {
    if (!user || !matchUser || !checkingMatch || isMatch === undefined) {
      setNotification("");
      setShowConfetti(false);
      return;
    }
    if (isMatch) {
      setNotification("You have a Match !!");
    } else if (likeSent) {
      setNotification("Like sended, wait..");
    } else {
      setNotification("");
    }
  }, [user, matchUser, isMatch, likeSent, checkingMatch]);

  useEffect(() => {
    if (!user || !matchUser) return;
    const MATCH_CONFETTI_KEY = `match-celebrated-${user.username}-${matchUser.username}`;
    const alreadyCelebrated = localStorage.getItem(MATCH_CONFETTI_KEY);

    if (
      isMatch &&
      (prevIsMatch.current === false || prevIsMatch.current === undefined) &&
      !alreadyCelebrated
    ) {
      setShowConfetti(true);
      localStorage.setItem(MATCH_CONFETTI_KEY, "true");
      const timeout = setTimeout(() => setShowConfetti(false), 3000);
      prevIsMatch.current = isMatch;
      return () => clearTimeout(timeout);
    }

    prevIsMatch.current = isMatch;
  }, [isMatch, user, matchUser]);

  useEffect(() => {
    let interval: number;
    if (likeSent && user && matchUser && !isMatch) {
      const myUsername = normalize(user.username);
      const targetUsername = normalize(matchUser.username);
      const checkMatch = async () => {
        try {
          const res = await axiosPublic.get(
            `/isMatch/${myUsername}/${targetUsername}`,
            { withCredentials: true }
          );
          if (res.data.isMatch) {
            setIsMatch(true);
            await refreshUser();
            clearInterval(interval);
          }
        } catch (err) {}
      };
      interval = window.setInterval(checkMatch, 3000);
      return () => clearInterval(interval);
    }
  }, [likeSent, user, matchUser, isMatch]);

  return (
    <div className="max-w-md mx-auto p-0 bg-white rounded-3xl shadow-lg flex flex-col items-center min-h-screen">
      {showConfetti && (
        <ReactConfetti width={width} height={height} numberOfPieces={400} />
      )}
      <div className="w-full flex flex-col items-center mt-8">
        <div className="w-full flex justify-between items-center px-4">
          <Link className="mb-5" to="/matche" title="Back">
            <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-gray-700" />
          </Link>
          {!likeSent && (
            <button
              onClick={handleLike}
              className="btn btn-outline-dark flex items-center gap-2 px-4 py-2 rounded-full border-2 border-red-700! text-red-500! bg-white hover:bg-red-700! hover:text-white! transition font-semibold text-lg shadow-sm mb-5"
              title="Like"
            >
              <Heart className="w-6 h-7" />
            </button>
          )}
        </div>
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex justify-center relative">
            <div className="w-80 h-96 flex items-center justify-center relative">
              <Carousel
                indicators={true}
                controls={true}
                interval={null}
                className="w-full h-full"
              >
                <Carousel.Item>
                  <img
                    src={matchUser?.userImage || "/default-avatar.png"}
                    alt={matchUser?.username}
                    className="d-block w-full h-96 object-cover rounded-2xl shadow-md"
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    src={matchUser?.dogImage || "/default-dog.png"}
                    alt={
                      matchUser?.dogBreed
                        ? `${matchUser.username}'s dog`
                        : "not available"
                    }
                    className="d-block w-full h-96 object-cover rounded-2xl shadow-md"
                  />
                </Carousel.Item>
              </Carousel>
            </div>
          </div>
          <div className="w-full flex flex-col items-center mt-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              {matchUser?.username},{" "}
              {matchUser?.birthday ? calculateAge(matchUser?.birthday) : "-"}
            </h1>
            <div className="text-gray-500 text-center text-lg mt-1">
              {matchUser?.gender}
            </div>
            {matchUser?.description && (
              <p className="mt-4 text-gray-700 text-center text-base px-4">
                {matchUser.description}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {matchUser?.languages &&
                Array.isArray(matchUser?.languages) &&
                matchUser.languages.map((lang: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {lang}
                  </span>
                ))}
              {matchUser?.dogBreed && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {matchUser?.dogBreed}
                </span>
              )}
              {matchUser?.dogAge && (
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                  {formatDogAge(matchUser?.dogAge)}
                </span>
              )}
              {matchUser?.favoriteToy && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {matchUser.favoriteToy}
                </span>
              )}
            </div>
            {matchUser?.dogDescription && (
              <p className="mt-4 text-gray-700 text-center text-base px-4">
                🐶 {matchUser?.dogDescription}
              </p>
            )}
            <div className="mt-6 w-full flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                availability
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-center">
                {matchUser?.availability?.weekDay?.map(
                  (day: string, idx: number) => (
                    <li key={idx}>{day}</li>
                  )
                )}
              </ul>
              <p className="mt-2 text-gray-700">
                <strong>Time:</strong>{" "}
                {matchUser?.availability?.dayTime || "not available"}
              </p>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2 w-full">
              <span className="text-pink-600 text-sm min-h-[24px]">
                {notification}
              </span>
              {checkingMatch && canChat ? (
                <Link
                  to={canChat ? `/chat/${matchUser._id}` : "#"}
                  className={`mt-4 mb-4 inline-block bg-black text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ${
                    !canChat
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:brightness-110"
                  }`}
                  tabIndex={canChat ? 0 : -1}
                  aria-disabled={!canChat}
                >
                  Chat now 💬
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
