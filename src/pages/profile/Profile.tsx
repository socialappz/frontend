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
  const [, setNotification] = useState("");
  const [showLikeModal, setShowLikeModal] = useState(false);
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
      setShowLikeModal(true);
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

  if (matchUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-100 bg-white min-h-screen">
      {showConfetti && (
        <ReactConfetti width={width} height={height} numberOfPieces={400} />
      )}
      <div className="container max-w-6xl mx-auto py-6 px-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Link className="mb-0" to="/matche" title="Back">
            <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-gray-700" />
          </Link>
          {!likeSent && (
            <button
              onClick={handleLike}
              className="btn btn-dark d-flex align-items-center gap-2 px-4 py-2 rounded-full fw-semibold shadow-sm"
              title="Like"
            >
              <Heart className="w-6 h-7" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-3xl overflow-hidden shadow border border-light bg-white">
            <div className="w-100 h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] xl:h-[560px] overflow-hidden">
              <Carousel
                indicators={true}
                controls={true}
                interval={null}
                className="w-100 h-100"
              >
                <Carousel.Item>
                  <img
                    src={matchUser?.userImage || "/default-avatar.png"}
                    alt={matchUser?.username}
                    className="d-block w-100 h-100 object-cover"
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
                    className="d-block w-100 h-100 object-cover"
                  />
                </Carousel.Item>
              </Carousel>
            </div>
            <div className="p-4 border-top position-relative z-10 bg-white">
              <h1 className="h4 fw-bold text-dark mb-1">
                {matchUser?.username}{" "}
                <span className="text-secondary">
                  {matchUser?.birthday
                    ? `• ${calculateAge(matchUser?.birthday)}`
                    : ""}
                </span>
              </h1>
              <div className="text-secondary small mb-2">
                {matchUser?.gender}
              </div>
              {matchUser?.description && (
                <p className="text-dark m-0">{matchUser.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl p-4 shadow border border-light bg-white">
              <h2 className="h6 fw-semibold text-dark mb-3">Info</h2>
              <div className="d-flex flex-wrap gap-2">
                {matchUser?.languages &&
                  Array.isArray(matchUser?.languages) &&
                  matchUser.languages.map((lang: string, idx: number) => (
                    <span key={idx} className="badge bg-light text-dark border">
                      {lang}
                    </span>
                  ))}
                {matchUser?.dogBreed && (
                  <span className="badge bg-warning-subtle text-warning-emphasis border">
                    {matchUser?.dogBreed}
                  </span>
                )}
                {matchUser?.dogAge && (
                  <span className="badge bg-pink-100 text-pink-700 border">
                    {formatDogAge(matchUser?.dogAge)}
                  </span>
                )}
                {matchUser?.favoriteToy && (
                  <span className="badge bg-primary-subtle text-primary-emphasis border">
                    {matchUser.favoriteToy}
                  </span>
                )}
              </div>
              {matchUser?.dogDescription && (
                <p className="mt-3 text-dark">🐶 {matchUser?.dogDescription}</p>
              )}
            </div>

            <div className="rounded-3xl p-4 shadow border border-light bg-white">
              <h2 className="h6 fw-semibold text-dark mb-3">Availability</h2>
              <ul className="mb-2">
                {matchUser?.availability?.weekDay?.map(
                  (day: string, idx: number) => (
                    <li key={idx} className="text-dark small">
                      {day}
                    </li>
                  )
                )}
              </ul>
              <div className="text-dark small">
                <strong>Time:</strong>{" "}
                {matchUser?.availability?.dayTime || "not available"}
              </div>
            </div>

            <div className="rounded-3xl p-4 shadow border border-light bg-white d-flex gap-2">
              {!likeSent ? (
                <button onClick={handleLike} className="btn btn-dark flex-fill">
                  Like ❤️
                </button>
              ) : null}
              {checkingMatch && canChat ? (
                <Link
                  to={`/chat/${matchUser._id}`}
                  className="btn btn-outline-dark flex-fill"
                >
                  Chat now 💬
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {showLikeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowLikeModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 text-center">
            <p className="text-gray-700 mb-4">
              {isMatch
                ? "wow! you can now chat with each other."
                : "Your like has been sent. Fingers crossed!"}
            </p>
            <div className="flex justify-center gap-2">
              {isMatch ? (
                <Link
                  to={`/chat/${matchUser._id}`}
                  className="btn btn-dark"
                  onClick={() => setShowLikeModal(false)}
                >
                  Chat now 💬
                </Link>
              ) : null}
              <button
                className="btn btn-outline-dark"
                onClick={() => setShowLikeModal(false)}
              >
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
